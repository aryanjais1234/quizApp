import io
import logging
import re
from typing import List

logger = logging.getLogger(__name__)

try:
    import pdfplumber  # preferred PDF extractor

    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import PyPDF2  # fallback PDF extractor

    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False


class DocumentProcessor:
    """Extract text from documents and split it into overlapping chunks."""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    # ------------------------------------------------------------------
    # PDF extraction
    # ------------------------------------------------------------------

    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> str:
        """Extract text from raw PDF bytes using the best available library."""
        if HAS_PDFPLUMBER:
            return self._extract_with_pdfplumber(pdf_bytes)
        if HAS_PYPDF2:
            return self._extract_with_pypdf2(pdf_bytes)
        raise RuntimeError(
            "No PDF library is available. Install pdfplumber or PyPDF2."
        )

    def _extract_with_pdfplumber(self, pdf_bytes: bytes) -> str:
        import pdfplumber

        parts: List[str] = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    parts.append(text)
        return "\n\n".join(parts)

    def _extract_with_pypdf2(self, pdf_bytes: bytes) -> str:
        import PyPDF2

        parts: List[str] = []
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        for page in reader.pages:
            text = page.extract_text()
            if text:
                parts.append(text)
        return "\n\n".join(parts)

    # ------------------------------------------------------------------
    # Text chunking
    # ------------------------------------------------------------------

    def chunk_text(self, text: str) -> List[str]:
        """Split *text* into overlapping chunks of ~chunk_size characters."""
        if not text or not text.strip():
            return []

        # Normalise whitespace
        text = re.sub(r"\s+", " ", text).strip()

        chunks: List[str] = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + self.chunk_size, text_len)

            # Prefer breaking at sentence boundaries
            if end < text_len:
                for punct in (". ", "! ", "? ", "\n"):
                    pos = text.rfind(punct, start + self.chunk_size // 2, end)
                    if pos != -1:
                        end = pos + len(punct)
                        break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            # If we have reached the end of the text, stop.
            if end >= text_len:
                break

            start = end - self.chunk_overlap
            if start >= text_len:
                break

        return chunks

    # ------------------------------------------------------------------
    # Combined pipeline
    # ------------------------------------------------------------------

    # Default cap: ~5 million characters ≈ several thousand pages of text.
    MAX_TEXT_LENGTH = 5_000_000

    def process_text(self, text: str, source_id: str) -> List[dict]:
        """Return a list of chunk dicts ready for the embedding pipeline."""
        if len(text) > self.MAX_TEXT_LENGTH:
            logger.warning(
                "Text for source %s truncated from %d to %d characters",
                source_id, len(text), self.MAX_TEXT_LENGTH,
            )
            text = text[: self.MAX_TEXT_LENGTH]
        chunks = self.chunk_text(text)
        return [
            {
                "text": chunk,
                "source_id": source_id,
                "chunk_index": i,
                "chunk_count": len(chunks),
            }
            for i, chunk in enumerate(chunks)
        ]
