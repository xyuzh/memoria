"""
Main Memoria framework integrating all components.

Synthesizes research from:
- A-MEM (arXiv:2502.12110)
- ACE (arXiv:2510.04618)
- MIRIX (arXiv:2507.07957)
- Agentic RAG (arXiv:2501.09136)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any, Union
from uuid import UUID
import warnings

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None
    warnings.warn("sentence-transformers not installed. Semantic search will be limited.")

from memoria.core.config import MemoriaConfig
from memoria.core.memory_types import (
    Memory,
    EpisodicMemory,
    SemanticMemory,
    ProceduralMemory,
    MemoryType,
)
from memoria.core.context_engine import ContextEngine
from memoria.retrieval.retriever import MemoryRetriever
from memoria.consolidation.consolidator import MemoryConsolidator


class MemoryFramework:
    """
    Main memory framework for LLM agents.

    Provides comprehensive memory management with:
    - Multi-tier memory architecture (episodic, semantic, procedural)
    - Zettelkasten-inspired dynamic linking
    - Agentic context engineering with reflection
    - Hybrid retrieval strategies
    - Intelligent decay and consolidation
    """

    def __init__(
        self,
        config: Optional[MemoriaConfig] = None,
        **config_kwargs,
    ):
        """
        Initialize the memory framework.

        Args:
            config: Configuration object (or None to use defaults)
            **config_kwargs: Configuration parameters to override defaults
        """
        # Setup configuration
        if config is None:
            config = MemoriaConfig(**config_kwargs)
        self.config = config

        # Initialize memory stores
        self.memories: Dict[UUID, Memory] = {}
        self._memories_by_type: Dict[MemoryType, List[UUID]] = {
            mt: [] for mt in MemoryType
        }

        # Initialize subsystems
        self.context_engine = ContextEngine(config)
        self.consolidator = MemoryConsolidator(
            consolidation_threshold=config.consolidation_threshold
        )

        # Initialize embedding model
        self.embedding_model = None
        if SentenceTransformer and config.embedding_model:
            try:
                self.embedding_model = SentenceTransformer(config.embedding_model)
            except Exception as e:
                warnings.warn(f"Could not load embedding model: {e}")

        # Initialize retriever
        self.retriever = MemoryRetriever(
            memories=self.memories,
            embedding_function=self._embed if self.embedding_model else None,
        )

        # Tracking
        self.last_decay = datetime.utcnow()
        self.last_consolidation = datetime.utcnow()

    def _embed(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts."""
        if self.embedding_model is None:
            raise ValueError("Embedding model not available")
        embeddings = self.embedding_model.encode(texts)
        return embeddings.tolist()

    def add_memory(self, memory: Memory) -> UUID:
        """
        Add a memory to the framework.

        Args:
            memory: Memory object to add

        Returns:
            UUID of the added memory
        """
        # Generate embedding if needed
        if self.embedding_model and memory.embedding is None:
            memory.embedding = self._embed([memory.content])[0]

        # Add to stores
        self.memories[memory.id] = memory
        self._memories_by_type[memory.memory_type].append(memory.id)

        # Auto-link if Zettelkasten is enabled
        if self.config.enable_zettelkasten:
            self._auto_link_memory(memory)

        # Check for consolidation trigger
        if self.config.enable_consolidation:
            self._check_consolidation()

        # Check for memory limits and pruning
        self._check_memory_limits()

        return memory.id

    def add_episodic(
        self,
        content: str,
        tags: Optional[List[str]] = None,
        keywords: Optional[List[str]] = None,
        context: str = "",
        **kwargs,
    ) -> UUID:
        """
        Add an episodic memory.

        Args:
            content: Memory content
            tags: Categorical tags
            keywords: Keywords for indexing
            context: Contextual description
            **kwargs: Additional memory attributes

        Returns:
            Memory UUID
        """
        memory = EpisodicMemory(
            content=content,
            tags=tags or [],
            keywords=keywords or [],
            context=context,
            **kwargs,
        )
        return self.add_memory(memory)

    def add_semantic(
        self,
        content: str,
        entity: Optional[str] = None,
        keywords: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        **kwargs,
    ) -> UUID:
        """
        Add a semantic memory.

        Args:
            content: Knowledge content
            entity: Primary entity/concept
            keywords: Keywords for indexing
            tags: Categorical tags
            **kwargs: Additional memory attributes

        Returns:
            Memory UUID
        """
        memory = SemanticMemory(
            content=content,
            entity=entity,
            keywords=keywords or [],
            tags=tags or [],
            **kwargs,
        )
        return self.add_memory(memory)

    def add_procedural(
        self,
        content: str,
        workflow_name: str,
        steps: List[Dict[str, Any]],
        **kwargs,
    ) -> UUID:
        """
        Add a procedural memory.

        Args:
            content: Workflow description
            workflow_name: Name of the workflow
            steps: List of workflow steps
            **kwargs: Additional memory attributes

        Returns:
            Memory UUID
        """
        memory = ProceduralMemory(
            content=content, workflow_name=workflow_name, steps=steps, **kwargs
        )
        return self.add_memory(memory)

    def retrieve(
        self,
        query: str,
        k: int = 5,
        retrieval_strategy: Optional[str] = None,
        memory_types: Optional[List[MemoryType]] = None,
    ) -> List[Memory]:
        """
        Retrieve relevant memories.

        Args:
            query: Search query
            k: Number of memories to retrieve
            retrieval_strategy: Strategy to use (semantic, keyword, hybrid, graph)
            memory_types: Filter by memory types

        Returns:
            List of relevant memories
        """
        strategy = retrieval_strategy or self.config.retrieval_strategy

        # Update retriever's memory reference
        self.retriever.memories = self.memories

        if strategy == "semantic":
            results = self.retriever.retrieve_semantic(query, k, memory_types)
        elif strategy == "keyword":
            keywords = query.split()
            results = self.retriever.retrieve_keyword(keywords, k, memory_types)
        elif strategy == "hybrid":
            results = self.retriever.retrieve_hybrid(
                query, k, self.config.semantic_weight, memory_types
            )
        elif strategy == "graph":
            # Find seed memories using semantic search
            seeds = self.retriever.retrieve_semantic(query, k=3, memory_types=memory_types)
            seed_ids = [m.id for m in seeds]
            results = self.retriever.retrieve_graph(seed_ids, max_depth=2, k=k)
        else:
            raise ValueError(f"Unknown retrieval strategy: {strategy}")

        # Update access statistics
        for memory in results:
            memory.update_access()

        return results

    def _auto_link_memory(self, new_memory: Memory) -> None:
        """
        Automatically create Zettelkasten links to related memories.

        Args:
            new_memory: Newly added memory
        """
        if new_memory.embedding is None:
            return

        # Find similar memories
        candidates = [
            m
            for m in self.memories.values()
            if m.id != new_memory.id and m.embedding is not None
        ]

        similarities = []
        for candidate in candidates:
            similarity = new_memory.compute_relevance(candidate.embedding, recency_weight=0.1)
            if similarity >= self.config.linking_threshold:
                similarities.append((candidate, similarity))

        # Sort by similarity and link top candidates
        similarities.sort(key=lambda x: x[1], reverse=True)

        for candidate, _ in similarities[: self.config.max_links_per_memory]:
            # Create bidirectional links
            new_memory.links_to.add(candidate.id)
            candidate.linked_from.add(new_memory.id)

    def _check_consolidation(self) -> None:
        """Check if memory consolidation should be triggered."""
        episodic_ids = self._memories_by_type[MemoryType.EPISODIC]
        episodic_memories = [
            self.memories[mid] for mid in episodic_ids if isinstance(self.memories[mid], EpisodicMemory)
        ]

        if self.consolidator.should_consolidate(len(episodic_memories)):
            self.consolidate_memories()

    def consolidate_memories(self) -> List[SemanticMemory]:
        """
        Consolidate episodic memories into semantic knowledge.

        Returns:
            List of newly created semantic memories
        """
        episodic_ids = self._memories_by_type[MemoryType.EPISODIC]
        episodic_memories = [
            self.memories[mid] for mid in episodic_ids if isinstance(self.memories[mid], EpisodicMemory)
        ]

        # Run consolidation
        new_semantic = self.consolidator.consolidate(episodic_memories)

        # Add consolidated memories
        for semantic in new_semantic:
            self.add_memory(semantic)

        self.last_consolidation = datetime.utcnow()
        return new_semantic

    def _check_memory_limits(self) -> None:
        """Check and enforce memory limits, pruning if needed."""
        limits = {
            MemoryType.EPISODIC: self.config.max_episodic_memories,
            MemoryType.SEMANTIC: self.config.max_semantic_memories,
            MemoryType.PROCEDURAL: self.config.max_procedural_memories,
        }

        for memory_type, limit in limits.items():
            memory_ids = self._memories_by_type[memory_type]

            if len(memory_ids) > limit:
                self._prune_memories(memory_type, target=limit)

    def _prune_memories(self, memory_type: MemoryType, target: int) -> None:
        """
        Prune low-importance memories of a specific type.

        Args:
            memory_type: Type of memories to prune
            target: Target number of memories to keep
        """
        memory_ids = self._memories_by_type[memory_type]
        memories = [self.memories[mid] for mid in memory_ids]

        # Sort by importance (ascending, so lowest importance first)
        memories.sort(key=lambda m: m.importance_score)

        # Calculate how many to remove
        to_remove = len(memories) - target

        # Remove lowest importance memories that aren't pinned
        removed = 0
        for memory in memories:
            if removed >= to_remove:
                break

            if not memory.pinned and memory.importance_score < self.config.pruning_threshold:
                self._remove_memory(memory.id)
                removed += 1

    def _remove_memory(self, memory_id: UUID) -> None:
        """
        Remove a memory from the framework.

        Args:
            memory_id: UUID of memory to remove
        """
        if memory_id not in self.memories:
            return

        memory = self.memories[memory_id]

        # Remove from type index
        if memory_id in self._memories_by_type[memory.memory_type]:
            self._memories_by_type[memory.memory_type].remove(memory_id)

        # Remove links
        for linked_id in memory.links_to:
            if linked_id in self.memories:
                self.memories[linked_id].linked_from.discard(memory_id)

        for linked_id in memory.linked_from:
            if linked_id in self.memories:
                self.memories[linked_id].links_to.discard(memory_id)

        # Remove from main store
        del self.memories[memory_id]

    def apply_decay(self) -> None:
        """Apply intelligent decay to all memories."""
        if not self.config.enable_decay:
            return

        time_delta = (datetime.utcnow() - self.last_decay).total_seconds() / 3600

        for memory in self.memories.values():
            memory.apply_decay(time_delta)

        self.last_decay = datetime.utcnow()

    def reflect_and_curate(self) -> Dict[str, Any]:
        """
        Run reflection and curation cycle on contexts.

        Implements ACE's reflection and curation process.

        Returns:
            Reflection results
        """
        # Apply decay before reflection
        self.apply_decay()

        # Run context engine reflection
        if self.context_engine.should_reflect():
            results = self.context_engine.reflect_all_playbooks()
            self.context_engine.curate_all_playbooks()
            return results

        return {}

    def get_context_window(
        self,
        query: str,
        max_tokens: int = 4000,
        strategy: Optional[str] = None,
    ) -> str:
        """
        Generate optimized context window for a query.

        Args:
            query: Context query
            max_tokens: Maximum token budget
            strategy: Curation strategy

        Returns:
            Formatted context string
        """
        # Retrieve relevant memories
        relevant = self.retrieve(query, k=50)

        # Curate to fit token budget
        strategy = strategy or self.config.curation_strategy
        curated = self.context_engine.generate_context_window(
            relevant, max_tokens, strategy
        )

        # Compress into context string
        return self.context_engine.compress_context(curated)

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get framework statistics.

        Returns:
            Dictionary of statistics
        """
        stats = {
            "total_memories": len(self.memories),
            "by_type": {
                mt.value: len(self._memories_by_type[mt]) for mt in MemoryType
            },
            "total_links": sum(len(m.links_to) for m in self.memories.values()),
            "avg_importance": (
                sum(m.importance_score for m in self.memories.values()) / len(self.memories)
                if self.memories
                else 0
            ),
            "last_decay": self.last_decay.isoformat(),
            "last_consolidation": self.last_consolidation.isoformat(),
        }

        return stats
