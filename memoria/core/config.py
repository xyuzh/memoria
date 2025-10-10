"""
Configuration for the Memoria framework.
"""

from typing import Optional

from pydantic import BaseModel, Field


class MemoriaConfig(BaseModel):
    """Configuration for the memory framework."""

    # Model configuration
    model_name: str = Field(default="gpt-4", description="LLM model to use")
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        description="Embedding model for semantic search",
    )
    max_context_window: int = Field(default=128000, description="Maximum context window size")

    # Memory limits
    max_episodic_memories: int = Field(
        default=1000, description="Maximum episodic memories before pruning"
    )
    max_semantic_memories: int = Field(
        default=500, description="Maximum semantic memories before pruning"
    )
    max_procedural_memories: int = Field(
        default=200, description="Maximum procedural memories before pruning"
    )

    # Zettelkasten network
    enable_zettelkasten: bool = Field(
        default=True, description="Enable dynamic memory linking (Zettelkasten)"
    )
    linking_threshold: float = Field(
        default=0.75, ge=0.0, le=1.0, description="Similarity threshold for auto-linking memories"
    )
    max_links_per_memory: int = Field(
        default=10, description="Maximum outgoing links per memory"
    )

    # Context engineering (ACE)
    enable_reflection: bool = Field(
        default=True, description="Enable reflection and curation cycles"
    )
    reflection_interval_hours: float = Field(
        default=24.0, description="Hours between reflection cycles"
    )
    curation_strategy: str = Field(
        default="importance", description="Strategy for context curation (importance, recency, hybrid)"
    )

    # Retrieval configuration
    default_retrieval_k: int = Field(default=5, description="Default number of memories to retrieve")
    retrieval_strategy: str = Field(
        default="hybrid", description="Retrieval strategy (semantic, keyword, hybrid, graph)"
    )
    semantic_weight: float = Field(
        default=0.7, ge=0.0, le=1.0, description="Weight for semantic similarity in hybrid retrieval"
    )

    # Consolidation
    enable_consolidation: bool = Field(
        default=True, description="Enable episodic to semantic memory consolidation"
    )
    consolidation_threshold: int = Field(
        default=50, description="Number of related episodic memories to trigger consolidation"
    )

    # Decay and pruning
    enable_decay: bool = Field(default=True, description="Enable intelligent memory decay")
    decay_interval_hours: float = Field(
        default=1.0, description="Hours between decay application"
    )
    pruning_threshold: float = Field(
        default=0.1, ge=0.0, le=1.0, description="Importance threshold for pruning memories"
    )

    # Storage
    storage_backend: str = Field(
        default="chromadb", description="Storage backend (chromadb, sqlite, memory)"
    )
    storage_path: Optional[str] = Field(
        default=None, description="Path for persistent storage"
    )

    # Performance
    batch_size: int = Field(default=32, description="Batch size for embedding operations")
    enable_caching: bool = Field(default=True, description="Enable embedding caching")

    class Config:
        validate_assignment = True
