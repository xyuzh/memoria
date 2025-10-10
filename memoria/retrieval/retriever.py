"""
Memory retrieval with hybrid strategies.

Implements retrieval approaches from:
- Agentic RAG (arXiv:2501.09136): Dynamic retrieval with reflection
- A-MEM (arXiv:2502.12110): Zettelkasten graph-based retrieval
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
import numpy as np
import networkx as nx

from memoria.core.memory_types import Memory, MemoryType


class MemoryRetriever:
    """
    Hybrid memory retrieval with multiple strategies.

    Supports:
    - Semantic search via embeddings
    - Keyword-based retrieval
    - Graph-based traversal (Zettelkasten)
    - Hybrid fusion of multiple signals
    """

    def __init__(
        self,
        memories: Dict[UUID, Memory],
        embedding_function: Optional[Any] = None,
    ):
        """
        Initialize the retriever.

        Args:
            memories: Dictionary of memory ID to Memory objects
            embedding_function: Function to generate embeddings
        """
        self.memories = memories
        self.embedding_function = embedding_function
        self.graph: Optional[nx.DiGraph] = None

    def build_zettelkasten_graph(self) -> nx.DiGraph:
        """
        Build a directed graph representing Zettelkasten memory links.

        Returns:
            NetworkX directed graph with memories as nodes
        """
        graph = nx.DiGraph()

        # Add all memories as nodes
        for memory_id, memory in self.memories.items():
            graph.add_node(
                memory_id,
                content=memory.content,
                type=memory.memory_type,
                importance=memory.importance_score,
                keywords=memory.keywords,
                tags=memory.tags,
            )

        # Add edges based on memory links
        for memory_id, memory in self.memories.items():
            for linked_id in memory.links_to:
                if linked_id in self.memories:
                    # Edge weight based on importance of target memory
                    weight = self.memories[linked_id].importance_score
                    graph.add_edge(memory_id, linked_id, weight=weight)

        self.graph = graph
        return graph

    def retrieve_semantic(
        self, query: str, k: int = 5, memory_types: Optional[List[MemoryType]] = None
    ) -> List[Memory]:
        """
        Retrieve memories using semantic similarity.

        Args:
            query: Search query
            k: Number of memories to retrieve
            memory_types: Filter by memory types

        Returns:
            List of most relevant memories
        """
        if self.embedding_function is None:
            raise ValueError("Embedding function required for semantic retrieval")

        # Generate query embedding
        query_embedding = self.embedding_function([query])[0]

        # Filter memories by type if specified
        candidates = [
            m
            for m in self.memories.values()
            if memory_types is None or m.memory_type in memory_types
        ]

        # Compute relevance scores
        scored_memories = [
            (memory, memory.compute_relevance(query_embedding))
            for memory in candidates
            if memory.embedding is not None
        ]

        # Sort by relevance and return top k
        scored_memories.sort(key=lambda x: x[1], reverse=True)
        return [memory for memory, _ in scored_memories[:k]]

    def retrieve_keyword(
        self, keywords: List[str], k: int = 5, memory_types: Optional[List[MemoryType]] = None
    ) -> List[Memory]:
        """
        Retrieve memories using keyword matching.

        Args:
            keywords: List of keywords to match
            k: Number of memories to retrieve
            memory_types: Filter by memory types

        Returns:
            List of matching memories
        """
        keywords_lower = [kw.lower() for kw in keywords]

        # Filter and score memories
        scored_memories = []
        for memory in self.memories.values():
            if memory_types and memory.memory_type not in memory_types:
                continue

            # Count keyword matches
            memory_keywords = [kw.lower() for kw in memory.keywords]
            memory_tags = [tag.lower() for tag in memory.tags]
            all_terms = memory_keywords + memory_tags

            match_count = sum(1 for kw in keywords_lower if kw in all_terms)

            if match_count > 0:
                # Score combines match count and importance
                score = match_count * 0.6 + memory.importance_score * 0.4
                scored_memories.append((memory, score))

        # Sort and return top k
        scored_memories.sort(key=lambda x: x[1], reverse=True)
        return [memory for memory, _ in scored_memories[:k]]

    def retrieve_graph(
        self, seed_memory_ids: List[UUID], max_depth: int = 2, k: int = 5
    ) -> List[Memory]:
        """
        Retrieve memories via graph traversal from seed memories.

        Implements Zettelkasten-style knowledge network navigation.

        Args:
            seed_memory_ids: Starting memory nodes
            max_depth: Maximum traversal depth
            k: Maximum memories to retrieve

        Returns:
            List of connected memories
        """
        if self.graph is None:
            self.build_zettelkasten_graph()

        visited = set()
        result_memories = []

        # BFS traversal with depth limit
        queue = [(memory_id, 0) for memory_id in seed_memory_ids]

        while queue and len(result_memories) < k:
            current_id, depth = queue.pop(0)

            if current_id in visited or depth > max_depth:
                continue

            visited.add(current_id)

            if current_id in self.memories:
                memory = self.memories[current_id]
                result_memories.append(memory)

                # Add neighbors to queue
                if depth < max_depth:
                    for neighbor_id in memory.links_to:
                        if neighbor_id not in visited:
                            queue.append((neighbor_id, depth + 1))

        # Sort by importance before returning
        result_memories.sort(key=lambda m: m.importance_score, reverse=True)
        return result_memories[:k]

    def retrieve_hybrid(
        self,
        query: str,
        k: int = 5,
        semantic_weight: float = 0.7,
        memory_types: Optional[List[MemoryType]] = None,
    ) -> List[Memory]:
        """
        Hybrid retrieval combining semantic and keyword approaches.

        Args:
            query: Search query
            k: Number of memories to retrieve
            semantic_weight: Weight for semantic vs keyword (0-1)
            memory_types: Filter by memory types

        Returns:
            List of most relevant memories
        """
        # Extract keywords from query (simple tokenization)
        keywords = [word.strip().lower() for word in query.split() if len(word) > 3]

        # Get semantic results
        semantic_results = {}
        if semantic_weight > 0 and self.embedding_function:
            for i, memory in enumerate(
                self.retrieve_semantic(query, k=k * 2, memory_types=memory_types)
            ):
                semantic_results[memory.id] = 1.0 - (i / (k * 2))

        # Get keyword results
        keyword_results = {}
        if semantic_weight < 1 and keywords:
            for i, memory in enumerate(
                self.retrieve_keyword(keywords, k=k * 2, memory_types=memory_types)
            ):
                keyword_results[memory.id] = 1.0 - (i / (k * 2))

        # Combine scores
        all_memory_ids = set(semantic_results.keys()) | set(keyword_results.keys())
        combined_scores = []

        for memory_id in all_memory_ids:
            semantic_score = semantic_results.get(memory_id, 0)
            keyword_score = keyword_results.get(memory_id, 0)

            combined_score = (
                semantic_score * semantic_weight + keyword_score * (1 - semantic_weight)
            )

            combined_scores.append((memory_id, combined_score))

        # Sort by combined score
        combined_scores.sort(key=lambda x: x[1], reverse=True)

        # Return top k memories
        return [self.memories[memory_id] for memory_id, _ in combined_scores[:k]]

    def retrieve_with_reflection(
        self,
        query: str,
        k: int = 5,
        strategy: str = "hybrid",
        max_iterations: int = 2,
    ) -> List[Memory]:
        """
        Agentic retrieval with reflection and refinement.

        Implements the iterative refinement from Agentic RAG research.

        Args:
            query: Search query
            k: Number of memories to retrieve
            strategy: Retrieval strategy to use
            max_iterations: Maximum reflection iterations

        Returns:
            Refined list of most relevant memories
        """
        # Initial retrieval
        if strategy == "semantic":
            results = self.retrieve_semantic(query, k=k * 2)
        elif strategy == "keyword":
            keywords = query.split()
            results = self.retrieve_keyword(keywords, k=k * 2)
        elif strategy == "hybrid":
            results = self.retrieve_hybrid(query, k=k * 2)
        else:
            raise ValueError(f"Unknown strategy: {strategy}")

        # Reflection: analyze results and potentially refine
        # In a full implementation, this would use an LLM to assess relevance
        # and generate refined queries. For now, we use a simplified approach.

        for iteration in range(max_iterations - 1):
            if not results:
                break

            # Extract common themes from top results
            all_keywords = []
            all_tags = []
            for memory in results[:k]:
                all_keywords.extend(memory.keywords)
                all_tags.extend(memory.tags)

            # Find most common keywords/tags
            keyword_counts = {}
            for kw in all_keywords + all_tags:
                keyword_counts[kw] = keyword_counts.get(kw, 0) + 1

            # Refine query with common themes
            top_themes = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            refined_keywords = [theme[0] for theme in top_themes]

            # Re-retrieve with refined understanding
            if strategy == "hybrid":
                results = self.retrieve_hybrid(query, k=k)
            else:
                results = self.retrieve_keyword(refined_keywords, k=k)

        return results[:k]
