"""
Memory type definitions based on latest research.

Implements memory structures from:
- A-MEM (arXiv:2502.12110): Zettelkasten-inspired attributes
- MIRIX (arXiv:2507.07957): Multi-component memory architecture
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class MemoryType(str, Enum):
    """Types of memory in the framework."""

    EPISODIC = "episodic"  # Time-indexed interactions
    SEMANTIC = "semantic"  # Distilled knowledge
    PROCEDURAL = "procedural"  # Workflows and strategies
    CORE = "core"  # Active working memory
    KNOWLEDGE_VAULT = "knowledge_vault"  # Long-term persistent storage


class Memory(BaseModel):
    """
    Base memory unit with Zettelkasten-inspired attributes.

    Based on A-MEM's dynamic memory organization approach.
    """

    id: UUID = Field(default_factory=uuid4)
    content: str = Field(description="The actual memory content")
    memory_type: MemoryType = Field(description="Type of memory")

    # A-MEM Zettelkasten attributes
    keywords: List[str] = Field(
        default_factory=list, description="Keywords for indexing and retrieval"
    )
    tags: List[str] = Field(default_factory=list, description="Categorical tags")
    context: str = Field(default="", description="Contextual description")

    # Metadata
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    access_count: int = Field(default=0, description="Number of times accessed")
    last_accessed: Optional[datetime] = Field(default=None)
    importance_score: float = Field(default=0.5, ge=0.0, le=1.0)

    # Zettelkasten network - dynamic linking
    links_to: Set[UUID] = Field(
        default_factory=set, description="Outgoing links to related memories"
    )
    linked_from: Set[UUID] = Field(
        default_factory=set, description="Incoming links from related memories"
    )

    # Decay mechanism for intelligent memory pruning
    decay_rate: float = Field(default=0.01, description="Rate of importance decay over time")
    pinned: bool = Field(default=False, description="Prevent memory from being pruned")

    # Embeddings for semantic search
    embedding: Optional[List[float]] = Field(default=None, repr=False)

    # Custom metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)

    class Config:
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
            set: list,
        }
        use_enum_values = True

    def update_access(self) -> None:
        """Update access statistics when memory is retrieved."""
        self.access_count += 1
        self.last_accessed = datetime.utcnow()
        # Boost importance on access
        self.importance_score = min(1.0, self.importance_score + 0.05)

    def apply_decay(self, time_delta_hours: float) -> None:
        """
        Apply intelligent decay based on recency and access patterns.

        Implements the Intelligent Decay mechanism from recent research.
        """
        if self.pinned:
            return

        # Decay slows down with higher access count
        access_factor = 1.0 / (1.0 + self.access_count * 0.1)
        decay = self.decay_rate * time_delta_hours * access_factor

        self.importance_score = max(0.0, self.importance_score - decay)

    def compute_relevance(
        self, query_embedding: List[float], recency_weight: float = 0.3
    ) -> float:
        """
        Compute relevance score combining semantic similarity, recency, and importance.

        Args:
            query_embedding: Query vector for semantic similarity
            recency_weight: Weight for recency in final score (0-1)

        Returns:
            Composite relevance score
        """
        if self.embedding is None:
            return self.importance_score

        # Cosine similarity
        import numpy as np

        similarity = float(
            np.dot(query_embedding, self.embedding)
            / (np.linalg.norm(query_embedding) * np.linalg.norm(self.embedding))
        )

        # Recency score (decay over time)
        age_hours = (datetime.utcnow() - self.timestamp).total_seconds() / 3600
        recency_score = np.exp(-age_hours / 168)  # Half-life of ~1 week

        # Combine scores
        relevance = (
            similarity * (1 - recency_weight)
            + recency_score * recency_weight * 0.5
            + self.importance_score * 0.3
        )

        return float(relevance)


class EpisodicMemory(Memory):
    """
    Time-indexed interaction memory with temporal context.

    Stores specific events and interactions in chronological order.
    """

    memory_type: MemoryType = Field(default=MemoryType.EPISODIC, frozen=True)
    session_id: Optional[str] = Field(default=None, description="Session identifier")
    turn_number: Optional[int] = Field(default=None, description="Turn in conversation")

    # Temporal relationships
    previous_episode: Optional[UUID] = Field(default=None)
    next_episode: Optional[UUID] = Field(default=None)

    # Contextual snapshot
    conversation_context: List[Dict[str, str]] = Field(
        default_factory=list, description="Surrounding conversation turns"
    )


class SemanticMemory(Memory):
    """
    Distilled knowledge and generalized concepts.

    Represents abstract knowledge extracted from episodic memories.
    """

    memory_type: MemoryType = Field(default=MemoryType.SEMANTIC, frozen=True)

    # Knowledge structure
    entity: Optional[str] = Field(default=None, description="Primary entity/concept")
    relationships: Dict[str, List[str]] = Field(
        default_factory=dict, description="Relationships to other entities"
    )

    # Consolidation tracking
    source_episodes: Set[UUID] = Field(
        default_factory=set, description="Episodic memories this was derived from"
    )
    confidence: float = Field(default=0.5, ge=0.0, le=1.0, description="Confidence in knowledge")
    last_consolidated: datetime = Field(default_factory=datetime.utcnow)


class ProceduralMemory(Memory):
    """
    Learned workflows, strategies, and tool usage patterns.

    Stores how-to knowledge and successful execution patterns.
    """

    memory_type: MemoryType = Field(default=MemoryType.PROCEDURAL, frozen=True)

    # Workflow structure
    workflow_name: str = Field(description="Name of the workflow/strategy")
    steps: List[Dict[str, Any]] = Field(default_factory=list, description="Sequence of steps")

    # Success tracking
    execution_count: int = Field(default=0, description="Number of times executed")
    success_count: int = Field(default=0, description="Number of successful executions")

    # Conditions and outcomes
    preconditions: List[str] = Field(default_factory=list, description="When to use this workflow")
    expected_outcomes: List[str] = Field(
        default_factory=list, description="Expected results of execution"
    )

    @property
    def success_rate(self) -> float:
        """Calculate success rate of this workflow."""
        if self.execution_count == 0:
            return 0.0
        return self.success_count / self.execution_count

    def record_execution(self, success: bool) -> None:
        """Record a workflow execution result."""
        self.execution_count += 1
        if success:
            self.success_count += 1
            self.importance_score = min(1.0, self.importance_score + 0.1)
        else:
            self.importance_score = max(0.0, self.importance_score - 0.05)
