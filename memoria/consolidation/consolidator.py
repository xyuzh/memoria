"""
Memory consolidation from episodic to semantic.

Implements consolidation strategies inspired by neuroscience and recent research.
"""

from typing import List, Dict, Set, Optional
from uuid import UUID
from collections import defaultdict
from datetime import datetime

from memoria.core.memory_types import (
    Memory,
    EpisodicMemory,
    SemanticMemory,
    MemoryType,
)


class MemoryConsolidator:
    """
    Consolidates episodic memories into semantic knowledge.

    Implements memory consolidation similar to human memory processes,
    where repeated patterns and important information are distilled
    into generalized knowledge.
    """

    def __init__(self, consolidation_threshold: int = 50):
        """
        Initialize the consolidator.

        Args:
            consolidation_threshold: Number of related episodes to trigger consolidation
        """
        self.consolidation_threshold = consolidation_threshold

    def identify_clusters(
        self, episodic_memories: List[EpisodicMemory]
    ) -> List[List[EpisodicMemory]]:
        """
        Identify clusters of related episodic memories.

        Args:
            episodic_memories: List of episodic memories

        Returns:
            List of memory clusters (each cluster is a list of related memories)
        """
        # Group by keywords and tags
        keyword_groups: Dict[str, List[EpisodicMemory]] = defaultdict(list)

        for memory in episodic_memories:
            # Group by each keyword/tag
            for keyword in memory.keywords + memory.tags:
                keyword_groups[keyword.lower()].append(memory)

        # Find clusters with sufficient overlap
        clusters: List[List[EpisodicMemory]] = []
        processed: Set[UUID] = set()

        for keyword, memories in keyword_groups.items():
            if len(memories) < 3:  # Need at least 3 related memories
                continue

            # Create cluster from unprocessed memories
            cluster = [m for m in memories if m.id not in processed]

            if len(cluster) >= 3:
                clusters.append(cluster)
                for m in cluster:
                    processed.add(m.id)

        return clusters

    def extract_patterns(self, cluster: List[EpisodicMemory]) -> Dict[str, any]:
        """
        Extract patterns and common themes from a memory cluster.

        Args:
            cluster: List of related episodic memories

        Returns:
            Dictionary of extracted patterns
        """
        # Aggregate keywords and tags
        all_keywords = []
        all_tags = []
        all_entities = set()

        for memory in cluster:
            all_keywords.extend(memory.keywords)
            all_tags.extend(memory.tags)

            # Simple entity extraction (capitalized words)
            words = memory.content.split()
            entities = [w for w in words if w and w[0].isupper() and len(w) > 2]
            all_entities.update(entities)

        # Count frequencies
        keyword_freq = defaultdict(int)
        tag_freq = defaultdict(int)

        for kw in all_keywords:
            keyword_freq[kw.lower()] += 1

        for tag in all_tags:
            tag_freq[tag.lower()] += 1

        # Most common keywords/tags
        top_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        top_tags = sorted(tag_freq.items(), key=lambda x: x[1], reverse=True)[:3]

        return {
            "keywords": [kw for kw, _ in top_keywords],
            "tags": [tag for tag, _ in top_tags],
            "entities": list(all_entities),
            "cluster_size": len(cluster),
            "time_span": (
                max(m.timestamp for m in cluster) - min(m.timestamp for m in cluster)
            ).total_seconds()
            / 3600,  # hours
        }

    def consolidate_cluster(self, cluster: List[EpisodicMemory]) -> SemanticMemory:
        """
        Consolidate a cluster of episodic memories into semantic knowledge.

        Args:
            cluster: List of related episodic memories

        Returns:
            Consolidated semantic memory
        """
        patterns = self.extract_patterns(cluster)

        # Generate consolidated content
        # In a full implementation, this would use an LLM to synthesize
        # For now, create a summary based on patterns
        content_parts = []

        if patterns["entities"]:
            entities = ", ".join(list(patterns["entities"])[:5])
            content_parts.append(f"Knowledge about: {entities}")

        # Add most common themes
        if patterns["keywords"]:
            themes = ", ".join(patterns["keywords"][:3])
            content_parts.append(f"Related to: {themes}")

        # Reference cluster size
        content_parts.append(f"Consolidated from {patterns['cluster_size']} interactions")

        content = ". ".join(content_parts)

        # Create semantic memory
        semantic = SemanticMemory(
            content=content,
            keywords=patterns["keywords"],
            tags=patterns["tags"],
            source_episodes={m.id for m in cluster},
            confidence=min(1.0, patterns["cluster_size"] / self.consolidation_threshold),
            importance_score=sum(m.importance_score for m in cluster) / len(cluster),
        )

        # Extract primary entity if available
        if patterns["entities"]:
            semantic.entity = list(patterns["entities"])[0]

        return semantic

    def consolidate(
        self, episodic_memories: List[EpisodicMemory]
    ) -> List[SemanticMemory]:
        """
        Run full consolidation process.

        Args:
            episodic_memories: All episodic memories to consider

        Returns:
            List of consolidated semantic memories
        """
        # Identify clusters
        clusters = self.identify_clusters(episodic_memories)

        # Consolidate each cluster
        semantic_memories = []
        for cluster in clusters:
            if len(cluster) >= 3:  # Minimum cluster size
                semantic = self.consolidate_cluster(cluster)
                semantic_memories.append(semantic)

        return semantic_memories

    def should_consolidate(self, episodic_count: int) -> bool:
        """
        Determine if consolidation should be triggered.

        Args:
            episodic_count: Current number of episodic memories

        Returns:
            True if consolidation threshold is reached
        """
        return episodic_count >= self.consolidation_threshold
