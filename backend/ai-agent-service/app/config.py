from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Gemini API
    gemini_api_key: str = ""

    # JWT (must match Spring Boot secret)
    jwt_secret: str = (
        "WnZr4u7x!A%D*G-KaPdSgUkXp2s5v8y/B?E(H+MbQeThWmZq4t7w9z$C&F)J@NcRf"
    )
    jwt_algorithm: str = "HS256"

    # ChromaDB persistent storage
    chroma_persist_dir: str = "./chroma_data"

    # Sentence-transformer model for embeddings
    embedding_model: str = "all-MiniLM-L6-v2"

    # Internal microservice URLs (override in .env / Docker)
    material_service_url: str = "http://localhost:8082"
    question_service_url: str = "http://localhost:8086"
    quiz_service_url: str = "http://localhost:8081"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
