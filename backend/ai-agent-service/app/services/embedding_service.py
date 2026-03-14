from typing import List

from app.config import settings


class EmbeddingService:
    """Singleton wrapper around a SentenceTransformer model.

    The model is loaded lazily on first use to avoid slowing down startup.
    """

    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self) -> None:
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            print(f"[EmbeddingService] Loading model: {settings.embedding_model}")
            self._model = SentenceTransformer(settings.embedding_model)

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Return embeddings for a batch of texts."""
        self._load_model()
        embeddings = self._model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()

    def embed_query(self, query: str) -> List[float]:
        """Return embedding for a single query string."""
        self._load_model()
        embedding = self._model.encode([query], show_progress_bar=False)
        return embedding[0].tolist()
