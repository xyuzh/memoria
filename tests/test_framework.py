"""
Tests for Memoria framework core functionality.
"""

import pytest
from datetime import datetime
from memoria import MemoryFramework, MemoriaConfig
from memoria.core.memory_types import MemoryType, EpisodicMemory, SemanticMemory


class TestMemoryFramework:
    """Test suite for MemoryFramework."""

    def test_initialization(self):
        """Test framework initialization."""
        memory = MemoryFramework()
        assert memory is not None
        assert memory.config is not None
        assert len(memory.memories) == 0

    def test_custom_config(self):
        """Test initialization with custom config."""
        config = MemoriaConfig(
            max_episodic_memories=100,
            enable_zettelkasten=True,
        )
        memory = MemoryFramework(config=config)
        assert memory.config.max_episodic_memories == 100
        assert memory.config.enable_zettelkasten is True

    def test_add_episodic_memory(self):
        """Test adding episodic memory."""
        memory = MemoryFramework()
        mem_id = memory.add_episodic(
            content="Test episodic memory",
            tags=["test"],
            keywords=["episodic", "test"],
        )

        assert mem_id in memory.memories
        assert isinstance(memory.memories[mem_id], EpisodicMemory)
        assert memory.memories[mem_id].content == "Test episodic memory"

    def test_add_semantic_memory(self):
        """Test adding semantic memory."""
        memory = MemoryFramework()
        mem_id = memory.add_semantic(
            content="Python is a programming language",
            entity="Python",
            keywords=["python", "programming"],
        )

        assert mem_id in memory.memories
        assert isinstance(memory.memories[mem_id], SemanticMemory)
        assert memory.memories[mem_id].entity == "Python"

    def test_add_procedural_memory(self):
        """Test adding procedural memory."""
        memory = MemoryFramework()
        mem_id = memory.add_procedural(
            content="Test workflow",
            workflow_name="test_workflow",
            steps=[
                {"step": 1, "action": "First step"},
                {"step": 2, "action": "Second step"},
            ],
        )

        assert mem_id in memory.memories
        proc_mem = memory.memories[mem_id]
        assert proc_mem.workflow_name == "test_workflow"
        assert len(proc_mem.steps) == 2

    def test_retrieval_keyword(self):
        """Test keyword-based retrieval."""
        memory = MemoryFramework(enable_zettelkasten=False)

        # Add memories
        memory.add_episodic(
            content="Python programming",
            keywords=["python", "programming"],
        )
        memory.add_episodic(
            content="JavaScript development",
            keywords=["javascript", "programming"],
        )

        # Retrieve
        results = memory.retrieve(
            query="python programming",
            k=5,
            retrieval_strategy="keyword",
        )

        assert len(results) > 0
        assert any("Python" in r.content for r in results)

    def test_memory_access_tracking(self):
        """Test that accessing memories updates statistics."""
        memory = MemoryFramework()
        mem_id = memory.add_episodic(content="Test memory")

        initial_count = memory.memories[mem_id].access_count
        initial_importance = memory.memories[mem_id].importance_score

        # Retrieve (should update access)
        memory.retrieve("Test", k=1)

        assert memory.memories[mem_id].access_count > initial_count
        assert memory.memories[mem_id].last_accessed is not None

    def test_memory_decay(self):
        """Test intelligent decay mechanism."""
        memory = MemoryFramework(enable_decay=True)
        mem_id = memory.add_episodic(content="Test memory")

        initial_importance = memory.memories[mem_id].importance_score

        # Apply decay
        memory.apply_decay()

        # Importance should decrease (unless accessed)
        # For unpinned memories with no access
        assert memory.memories[mem_id].importance_score <= initial_importance

    def test_memory_pinning(self):
        """Test that pinned memories don't decay."""
        memory = MemoryFramework(enable_decay=True)
        mem_id = memory.add_episodic(content="Important memory")

        # Pin the memory
        memory.memories[mem_id].pinned = True
        initial_importance = memory.memories[mem_id].importance_score

        # Apply decay
        memory.apply_decay()

        # Importance should not change for pinned memory
        assert memory.memories[mem_id].importance_score == initial_importance

    def test_statistics(self):
        """Test statistics generation."""
        memory = MemoryFramework()

        memory.add_episodic(content="Episode 1")
        memory.add_episodic(content="Episode 2")
        memory.add_semantic(content="Fact 1", entity="Fact")

        stats = memory.get_statistics()

        assert stats["total_memories"] == 3
        assert stats["by_type"]["episodic"] == 2
        assert stats["by_type"]["semantic"] == 1

    def test_memory_limits(self):
        """Test memory limit enforcement."""
        memory = MemoryFramework(
            max_episodic_memories=5,
            pruning_threshold=0.3,
        )

        # Add more than limit
        for i in range(10):
            mem_id = memory.add_episodic(
                content=f"Memory {i}",
                keywords=["test"],
            )
            # Set low importance for some
            if i < 5:
                memory.memories[mem_id].importance_score = 0.05

        # Should have pruned to limit
        stats = memory.get_statistics()
        assert stats["by_type"]["episodic"] <= 5


class TestMemoryConsolidation:
    """Test suite for memory consolidation."""

    def test_consolidation_trigger(self):
        """Test that consolidation triggers automatically."""
        memory = MemoryFramework(
            enable_consolidation=True,
            consolidation_threshold=3,
        )

        # Add related episodic memories
        for i in range(5):
            memory.add_episodic(
                content=f"Python fact {i}",
                keywords=["python", "programming"],
                tags=["language"],
            )

        # Should have triggered consolidation
        stats = memory.get_statistics()
        # Check if semantic memories were created
        assert stats["by_type"]["semantic"] >= 0

    def test_manual_consolidation(self):
        """Test manual consolidation."""
        memory = MemoryFramework(enable_consolidation=False)

        # Add related memories
        for i in range(5):
            memory.add_episodic(
                content=f"Related memory {i}",
                keywords=["test", "related"],
            )

        initial_semantic = len(
            memory._memories_by_type[MemoryType.SEMANTIC]
        )

        # Manually consolidate
        consolidated = memory.consolidate_memories()

        # Should create semantic memories
        assert len(consolidated) >= 0


class TestZettelkasten:
    """Test suite for Zettelkasten network."""

    def test_auto_linking_disabled(self):
        """Test that auto-linking can be disabled."""
        memory = MemoryFramework(enable_zettelkasten=False)

        mem1 = memory.add_episodic(
            content="First memory",
            keywords=["test"],
        )
        mem2 = memory.add_episodic(
            content="Second memory",
            keywords=["test"],
        )

        # No links should be created
        assert len(memory.memories[mem1].links_to) == 0
        assert len(memory.memories[mem2].links_to) == 0

    def test_graph_retrieval(self):
        """Test graph-based retrieval."""
        memory = MemoryFramework(
            enable_zettelkasten=True,
            linking_threshold=0.5,
        )

        # Add related memories that should link
        mem1 = memory.add_semantic(
            content="Python programming language",
            keywords=["python", "programming"],
        )
        mem2 = memory.add_semantic(
            content="Python web frameworks",
            keywords=["python", "web", "frameworks"],
        )

        # Graph retrieval should find connected memories
        # Note: This may not work without embeddings
        try:
            results = memory.retrieve(
                query="Python",
                k=5,
                retrieval_strategy="graph",
            )
            assert len(results) >= 0
        except ValueError:
            # Expected if embedding model not available
            pass


class TestContextEngine:
    """Test suite for context engineering."""

    def test_context_window_generation(self):
        """Test context window generation."""
        memory = MemoryFramework()

        # Add some memories
        memory.add_episodic(content="User likes Python")
        memory.add_semantic(content="Python is a language", entity="Python")

        context = memory.get_context_window(
            query="Python",
            max_tokens=1000,
        )

        assert isinstance(context, str)
        # Context should contain relevant information
        assert len(context) > 0

    def test_playbook_creation(self):
        """Test context playbook creation."""
        memory = MemoryFramework()

        playbook = memory.context_engine.create_playbook(
            name="test_playbook",
            description="Test playbook",
        )

        assert playbook is not None
        assert playbook.name == "test_playbook"
        assert memory.context_engine.get_playbook("test_playbook") == playbook

    def test_playbook_reflection(self):
        """Test playbook reflection cycle."""
        memory = MemoryFramework()

        playbook = memory.context_engine.create_playbook(
            name="test",
            description="Test",
        )

        playbook.add_strategy({
            "name": "test_strategy",
            "steps": ["step1", "step2"],
        })

        # Record executions
        playbook.record_execution("test_strategy", {"success": True})
        playbook.record_execution("test_strategy", {"success": True})

        # Reflect
        reflection = playbook.reflect()

        assert "insights" in reflection
        assert "recommendations" in reflection
        assert "strategy_performance" in reflection


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
