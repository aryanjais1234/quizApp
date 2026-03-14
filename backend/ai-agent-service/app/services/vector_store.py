import os
os.environ["ANONYMIZED_TELEMETRY"] = "False"

from typing import Any, Dict, List, Optional

import chromadb

from app.config import settings

COLLECTION_NAME = "materials"


class VectorStore:
    """Singleton ChromaDB client with a persistent local store."""

    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _get_client(self):
        if self._client is None:
            self._client = chromadb.PersistentClient(
                path=settings.chroma_persist_dir,
                settings=chromadb.Settings(anonymized_telemetry=False),
            )
        return self._client

    def get_or_create_collection(self, name: str = COLLECTION_NAME):
        return self._get_client().get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"},
        )

    # ------------------------------------------------------------------
    # Write
    # ------------------------------------------------------------------

    def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        ids: List[str],
        metadatas: Optional[List[Dict[str, Any]]] = None,
    ) -> None:
        """Upsert documents into the default collection."""
        collection = self.get_or_create_collection()
        collection.upsert(
            documents=texts,
            embeddings=embeddings,
            ids=ids,
            metadatas=metadatas or [{} for _ in texts],
        )

    def delete_by_source(self, source_id: str) -> None:
        """Remove all chunks that belong to *source_id*."""
        try:
            collection = self.get_or_create_collection()
            collection.delete(where={"source_id": source_id})
        except Exception as exc:
            print(f"[VectorStore] delete_by_source error: {exc}")

    # ------------------------------------------------------------------
    # Read
    # ------------------------------------------------------------------

    def query(
        self,
        query_embedding: List[float],
        n_results: int = 5,
        where: Optional[Dict] = None,
    ) -> List[Dict[str, Any]]:
        """Return the *n_results* most-similar documents."""
        collection = self.get_or_create_collection()

        kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": n_results,
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            kwargs["where"] = where

        results = collection.query(**kwargs)

        documents: List[Dict[str, Any]] = []
        if results and results.get("documents"):
            for i, doc in enumerate(results["documents"][0]):
                documents.append(
                    {
                        "text": doc,
                        "metadata": (
                            results["metadatas"][0][i]
                            if results.get("metadatas")
                            else {}
                        ),
                        "distance": (
                            results["distances"][0][i]
                            if results.get("distances")
                            else None
                        ),
                    }
                )
        return documents

    def has_documents(self) -> bool:
        """Return True if the default collection is non-empty."""
        try:
            return self.get_or_create_collection().count() > 0
        except Exception:
            return False