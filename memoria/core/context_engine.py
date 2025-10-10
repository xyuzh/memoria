"""
Agentic Context Engineering (ACE) implementation.

Based on ACE (arXiv:2510.04618): Evolving contexts as playbooks with
generation, reflection, and curation.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import UUID

from memoria.core.memory_types import Memory, MemoryType, SemanticMemory
from memoria.core.config import MemoriaConfig


class ContextPlaybook:
    """
    Evolving context playbook that accumulates, refines, and organizes strategies.

    Implements the core ACE concept of contexts as living documents that improve
    over time through reflection and curation.
    """

    def __init__(self, name: str, description: str = ""):
        """
        Initialize a context playbook.

        Args:
            name: Playbook identifier
            description: Playbook description
        """
        self.name = name
        self.description = description
        self.strategies: List[Dict[str, Any]] = []
        self.execution_history: List[Dict[str, Any]] = []
        self.last_updated = datetime.utcnow()
        self.version = 1

    def add_strategy(self, strategy: Dict[str, Any]) -> None:
        """
        Add a new strategy to the playbook.

        Args:
            strategy: Strategy specification with keys like 'name', 'steps', 'conditions'
        """
        strategy["added_at"] = datetime.utcnow()
        strategy["version"] = self.version
        self.strategies.append(strategy)

    def record_execution(self, strategy_name: str, outcome: Dict[str, Any]) -> None:
        """
        Record execution outcome for reflection.

        Args:
            strategy_name: Name of executed strategy
            outcome: Execution results and metrics
        """
        self.execution_history.append(
            {
                "strategy": strategy_name,
                "outcome": outcome,
                "timestamp": datetime.utcnow(),
            }
        )

    def reflect(self) -> Dict[str, Any]:
        """
        Analyze execution history and generate insights.

        Returns:
            Reflection results with insights and recommendations
        """
        if not self.execution_history:
            return {"insights": [], "recommendations": []}

        # Analyze success patterns
        strategy_performance = {}
        for execution in self.execution_history:
            strategy = execution["strategy"]
            success = execution["outcome"].get("success", False)

            if strategy not in strategy_performance:
                strategy_performance[strategy] = {"total": 0, "success": 0}

            strategy_performance[strategy]["total"] += 1
            if success:
                strategy_performance[strategy]["success"] += 1

        # Generate insights
        insights = []
        recommendations = []

        for strategy, perf in strategy_performance.items():
            success_rate = perf["success"] / perf["total"] if perf["total"] > 0 else 0

            if success_rate > 0.8:
                insights.append(f"Strategy '{strategy}' highly effective ({success_rate:.1%})")
            elif success_rate < 0.3:
                insights.append(f"Strategy '{strategy}' needs improvement ({success_rate:.1%})")
                recommendations.append(f"Consider refining or replacing strategy '{strategy}'")

        return {
            "insights": insights,
            "recommendations": recommendations,
            "strategy_performance": strategy_performance,
        }

    def curate(self, reflection_results: Dict[str, Any]) -> None:
        """
        Refine playbook based on reflection insights.

        Args:
            reflection_results: Results from reflect() method
        """
        # Remove low-performing strategies
        performance = reflection_results.get("strategy_performance", {})
        self.strategies = [
            s
            for s in self.strategies
            if performance.get(s["name"], {}).get("success", 0)
            / performance.get(s["name"], {}).get("total", 1)
            >= 0.3
        ]

        self.version += 1
        self.last_updated = datetime.utcnow()


class ContextEngine:
    """
    Context Engineering subsystem implementing ACE principles.

    Manages evolving contexts both offline (system prompts) and
    online (agent memory) with reflection and curation.
    """

    def __init__(self, config: MemoriaConfig):
        """
        Initialize the context engine.

        Args:
            config: Framework configuration
        """
        self.config = config
        self.playbooks: Dict[str, ContextPlaybook] = {}
        self.last_reflection = datetime.utcnow()

    def create_playbook(self, name: str, description: str = "") -> ContextPlaybook:
        """
        Create a new context playbook.

        Args:
            name: Playbook name
            description: Playbook description

        Returns:
            Created playbook
        """
        playbook = ContextPlaybook(name, description)
        self.playbooks[name] = playbook
        return playbook

    def get_playbook(self, name: str) -> Optional[ContextPlaybook]:
        """Get a playbook by name."""
        return self.playbooks.get(name)

    def should_reflect(self) -> bool:
        """
        Check if it's time for a reflection cycle.

        Returns:
            True if reflection interval has passed
        """
        if not self.config.enable_reflection:
            return False

        hours_since_reflection = (
            datetime.utcnow() - self.last_reflection
        ).total_seconds() / 3600

        return hours_since_reflection >= self.config.reflection_interval_hours

    def reflect_all_playbooks(self) -> Dict[str, Any]:
        """
        Run reflection cycle across all playbooks.

        Returns:
            Aggregated reflection results
        """
        results = {}
        for name, playbook in self.playbooks.items():
            results[name] = playbook.reflect()

        self.last_reflection = datetime.utcnow()
        return results

    def curate_all_playbooks(self) -> None:
        """Curate all playbooks based on their reflection results."""
        for playbook in self.playbooks.values():
            reflection = playbook.reflect()
            playbook.curate(reflection)

    def generate_context_window(
        self,
        memories: List[Memory],
        max_tokens: int,
        strategy: str = "importance",
    ) -> List[Memory]:
        """
        Generate optimized context window from memories.

        Implements ACE's context optimization to prevent context collapse.

        Args:
            memories: Candidate memories
            max_tokens: Maximum token budget
            strategy: Curation strategy (importance, recency, hybrid)

        Returns:
            Optimized list of memories fitting within token budget
        """
        if not memories:
            return []

        # Sort memories by curation strategy
        if strategy == "importance":
            sorted_memories = sorted(
                memories, key=lambda m: m.importance_score, reverse=True
            )
        elif strategy == "recency":
            sorted_memories = sorted(memories, key=lambda m: m.timestamp, reverse=True)
        elif strategy == "hybrid":
            # Combine importance and recency
            def hybrid_score(m: Memory) -> float:
                age_hours = (datetime.utcnow() - m.timestamp).total_seconds() / 3600
                recency_score = 1.0 / (1.0 + age_hours / 24)  # Decay over days
                return m.importance_score * 0.6 + recency_score * 0.4

            sorted_memories = sorted(memories, key=hybrid_score, reverse=True)
        else:
            sorted_memories = memories

        # Estimate tokens (rough approximation: 1 token ≈ 4 characters)
        selected = []
        current_tokens = 0

        for memory in sorted_memories:
            # Estimate memory token count
            memory_tokens = len(memory.content) // 4
            memory_tokens += sum(len(kw) // 4 for kw in memory.keywords)
            memory_tokens += len(memory.context) // 4

            if current_tokens + memory_tokens <= max_tokens:
                selected.append(memory)
                current_tokens += memory_tokens
            else:
                break

        return selected

    def compress_context(self, memories: List[Memory]) -> str:
        """
        Compress multiple memories into a concise context summary.

        Args:
            memories: Memories to compress

        Returns:
            Compressed context string
        """
        if not memories:
            return ""

        # Group by type
        by_type: Dict[MemoryType, List[Memory]] = {}
        for memory in memories:
            if memory.memory_type not in by_type:
                by_type[memory.memory_type] = []
            by_type[memory.memory_type].append(memory)

        # Build structured summary
        summary_parts = []

        # Semantic memories (key knowledge)
        if MemoryType.SEMANTIC in by_type:
            semantic = by_type[MemoryType.SEMANTIC]
            summary_parts.append("## Key Knowledge")
            for mem in semantic[:5]:  # Top 5 semantic memories
                summary_parts.append(f"- {mem.content}")

        # Procedural memories (strategies)
        if MemoryType.PROCEDURAL in by_type:
            procedural = by_type[MemoryType.PROCEDURAL]
            summary_parts.append("\n## Available Strategies")
            for mem in procedural[:3]:  # Top 3 strategies
                summary_parts.append(f"- {mem.content}")

        # Recent episodic context
        if MemoryType.EPISODIC in by_type:
            episodic = sorted(
                by_type[MemoryType.EPISODIC], key=lambda m: m.timestamp, reverse=True
            )
            summary_parts.append("\n## Recent Context")
            for mem in episodic[:5]:  # 5 most recent
                summary_parts.append(f"- {mem.content}")

        return "\n".join(summary_parts)
