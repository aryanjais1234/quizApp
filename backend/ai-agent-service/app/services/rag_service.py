from typing import List, Optional

from app.mcp.context_server import (
    extract_text_from_material,
    fetch_file_bytes,
    get_materials,
)
from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore

# File types supported for direct text extraction from the uploaded file
_PDF_TYPES = {"application/pdf"}
_TEXT_TYPES = {
    "text/plain",
    "text/markdown",
    "text/csv",
    "text/html",
    "application/json",
}


class RAGService:
    """Retrieval-Augmented Generation pipeline.

    Embeds study materials into ChromaDB and retrieves relevant context
    for quiz generation / chat.
    """

    def __init__(self):
        self.doc_processor = DocumentProcessor()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()

    # ------------------------------------------------------------------
    # Ingestion
    # ------------------------------------------------------------------

    async def embed_materials(self, material_ids: List[int], token: str) -> int:
        """Fetch materials, embed them, and store in ChromaDB.

        Returns the total number of chunks stored.
        """
        materials = await get_materials(material_ids, token)
        total_chunks = 0

        for material in materials:
            source_id = str(material.get("id"))
            text = extract_text_from_material(material)

            # If no transcript was provided, try to download and extract
            # text directly from the uploaded file.
            if not material.get("transcript"):
                file_text = await self._extract_text_from_file(material)
                if file_text:
                    if text.strip():
                        text = text + "\n\n" + file_text
                    else:
                        text = file_text

            if not text.strip():
                print(f"[RAGService] Material {source_id} has no text content — skipping")
                continue

            # Remove stale embeddings for this material
            self.vector_store.delete_by_source(source_id)

            docs = self.doc_processor.process_text(text, source_id)
            if not docs:
                continue

            texts = [d["text"] for d in docs]
            metadatas = [
                {
                    "source_id": source_id,
                    "chunk_index": d["chunk_index"],
                    "title": material.get("title", ""),
                    "category": material.get("category", ""),
                }
                for d in docs
            ]
            ids = [f"{source_id}_chunk_{d['chunk_index']}" for d in docs]

            embeddings = self.embedding_service.embed_texts(texts)
            self.vector_store.add_documents(texts, embeddings, ids, metadatas)
            total_chunks += len(docs)

        return total_chunks

    async def _extract_text_from_file(self, material: dict) -> str:
        """Download the uploaded file and extract its text content.

        Supports PDF files (via DocumentProcessor) and common text-based
        formats.  Returns an empty string when the file cannot be processed.
        """
        file_url = material.get("fileUrl") or material.get("file_url")
        file_type = (material.get("fileType") or material.get("file_type") or "").lower()
        source_id = str(material.get("id", "?"))

        if not file_url:
            return ""

        file_bytes = await fetch_file_bytes(file_url)
        if not file_bytes:
            print(f"[RAGService] Could not download file for material {source_id}")
            return ""

        # PDF extraction
        if file_type in _PDF_TYPES or file_url.lower().endswith(".pdf"):
            try:
                return self.doc_processor.extract_text_from_pdf_bytes(file_bytes)
            except Exception as exc:
                print(f"[RAGService] PDF extraction failed for material {source_id}: {exc}")
                return ""

        # Plain-text / text-based formats
        if file_type in _TEXT_TYPES or file_url.lower().endswith((".txt", ".md", ".csv")):
            try:
                return file_bytes.decode("utf-8", errors="replace")
            except Exception as exc:
                print(f"[RAGService] Text decode failed for material {source_id}: {exc}")
                return ""

        print(
            f"[RAGService] Unsupported file type '{file_type}' for material {source_id} "
            f"— add a transcript manually to include this material in quiz generation"
        )
        return ""

    # ------------------------------------------------------------------
    # Retrieval
    # ------------------------------------------------------------------

    async def retrieve_context(
        self,
        query: str,
        material_ids: Optional[List[int]] = None,
        n_results: int = 5,
        token: str = "",
    ) -> str:
        """Embed materials (if needed) then return relevant context string."""
        if material_ids:
            await self.embed_materials(material_ids, token)

        query_embedding = self.embedding_service.embed_query(query)

        # Build source filter
        where_filter: Optional[dict] = None
        if material_ids:
            source_ids = [str(mid) for mid in material_ids]
            if len(source_ids) == 1:
                where_filter = {"source_id": source_ids[0]}
            else:
                where_filter = {"source_id": {"$in": source_ids}}

        results = self.vector_store.query(
            query_embedding=query_embedding,
            n_results=n_results,
            where=where_filter,
        )

        if not results:
            return ""

        return "\n\n---\n\n".join(r["text"] for r in results)
