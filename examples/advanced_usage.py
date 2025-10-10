"""
Advanced usage example for Memoria framework.

Demonstrates:
- Memory consolidation
- Zettelkasten network traversal
- Context playbooks with ACE
- Custom memory decay strategies
"""

from datetime import datetime, timedelta
from memoria import MemoryFramework, MemoriaConfig
from memoria.core.memory_types import MemoryType

# Initialize framework with advanced features
config = MemoriaConfig(
    enable_zettelkasten=True,
    enable_consolidation=True,
    enable_reflection=True,
    consolidation_threshold=5,  # Lower threshold for demo
    reflection_interval_hours=1,
    linking_threshold=0.6,
)

memory = MemoryFramework(config=config)

print("=" * 60)
print("ADVANCED MEMORIA FRAMEWORK DEMO")
print("=" * 60)

# Simulate a series of related interactions
print("\n1. Adding related episodic memories for consolidation...")

related_memories = [
    "User asked about Python list comprehensions",
    "User requested examples of Python list comprehensions",
    "User successfully implemented list comprehension in their code",
    "User asked about performance of list comprehensions vs loops",
    "User mentioned they prefer list comprehensions for readability",
    "User used list comprehension to filter data in their project",
]

for content in related_memories:
    memory.add_episodic(
        content=content,
        keywords=["python", "list-comprehension"],
        tags=["learning", "python"],
    )

print(f"   Added {len(related_memories)} related memories")

# Trigger consolidation
print("\n2. Running memory consolidation...")
consolidated = memory.consolidate_memories()
print(f"   Created {len(consolidated)} semantic memories from episodic clusters")

for sem in consolidated:
    print(f"   - {sem.content}")
    print(f"     (Consolidated from {len(sem.source_episodes)} episodes, "
          f"confidence: {sem.confidence:.2f})")

# Demonstrate Zettelkasten network
print("\n3. Exploring Zettelkasten memory network...")

# Add some interconnected knowledge
kb_ids = []

kb_ids.append(
    memory.add_semantic(
        content="Python is a dynamically-typed interpreted language",
        entity="Python",
        keywords=["python", "programming", "dynamic-typing"],
    )
)

kb_ids.append(
    memory.add_semantic(
        content="Dynamic typing allows variables to change types at runtime",
        entity="Dynamic Typing",
        keywords=["dynamic-typing", "variables", "runtime"],
    )
)

kb_ids.append(
    memory.add_semantic(
        content="Type hints in Python provide optional static type checking",
        entity="Type Hints",
        keywords=["python", "type-hints", "static-typing"],
    )
)

print(f"   Added {len(kb_ids)} interconnected knowledge nodes")

# Check automatic links
total_links = sum(
    len(memory.memories[kid].links_to) for kid in kb_ids if kid in memory.memories
)
print(f"   Automatically created {total_links} Zettelkasten links")

# Graph traversal retrieval
print("\n4. Graph-based retrieval (Zettelkasten traversal)...")
results = memory.retrieve(
    query="Python typing systems",
    k=5,
    retrieval_strategy="graph",
)

print(f"   Retrieved {len(results)} memories via graph traversal:")
for i, mem in enumerate(results, 1):
    links = len(mem.links_to)
    print(f"   {i}. {mem.content[:60]}... ({links} links)")

# Context Playbooks (ACE)
print("\n5. Creating and using Context Playbooks...")

# Create a playbook for code review
playbook = memory.context_engine.create_playbook(
    name="code_review",
    description="Strategies for effective code review",
)

# Add strategies
playbook.add_strategy({
    "name": "check_style",
    "steps": ["Check PEP 8 compliance", "Verify naming conventions"],
    "conditions": ["Python code"],
})

playbook.add_strategy({
    "name": "check_security",
    "steps": ["Review input validation", "Check for SQL injection"],
    "conditions": ["Web application code"],
})

# Simulate execution outcomes
playbook.record_execution("check_style", {"success": True, "issues": 2})
playbook.record_execution("check_style", {"success": True, "issues": 0})
playbook.record_execution("check_security", {"success": True, "issues": 1})
playbook.record_execution("check_security", {"success": False, "error": "timeout"})

# Run reflection
reflection = playbook.reflect()
print(f"   Playbook '{playbook.name}' reflection:")
for insight in reflection["insights"]:
    print(f"   - {insight}")
for rec in reflection["recommendations"]:
    print(f"   → {rec}")

# Demonstrate intelligent decay
print("\n6. Demonstrating intelligent decay...")

# Create a memory and simulate aging
test_mem = memory.add_episodic(
    content="Test memory for decay demonstration",
    keywords=["test"],
)

initial_importance = memory.memories[test_mem].importance_score
print(f"   Initial importance: {initial_importance:.3f}")

# Simulate decay over time
memory.apply_decay()
after_decay = memory.memories[test_mem].importance_score
print(f"   After decay: {after_decay:.3f}")

# Access the memory (should boost importance)
memory.memories[test_mem].update_access()
after_access = memory.memories[test_mem].importance_score
print(f"   After access: {after_access:.3f} (boosted by access)")

# Memory pruning demonstration
print("\n7. Memory pruning and limits...")
initial_count = len(memory.memories)
print(f"   Current memory count: {initial_count}")

# Add many low-importance memories
for i in range(20):
    mem_id = memory.add_episodic(
        content=f"Low priority memory {i}",
        keywords=["test", "low-priority"],
    )
    # Set low importance
    memory.memories[mem_id].importance_score = 0.05

print(f"   Added 20 low-importance memories")
print(f"   New count: {len(memory.memories)}")

# Trigger pruning
memory._check_memory_limits()
print(f"   After pruning: {len(memory.memories)} memories")

# Generate comprehensive context
print("\n8. Generating optimized context window...")
context = memory.get_context_window(
    query="Python development best practices",
    max_tokens=2000,
    strategy="hybrid",
)

print("   Generated context preview:")
print("   " + "-" * 56)
for line in context.split("\n")[:10]:
    print(f"   {line}")
if len(context.split("\n")) > 10:
    print("   ...")

# Final statistics
print("\n9. Final framework statistics...")
stats = memory.get_statistics()
print(f"   Total memories: {stats['total_memories']}")
print(f"   Memory types: {stats['by_type']}")
print(f"   Zettelkasten links: {stats['total_links']}")
print(f"   Average importance: {stats['avg_importance']:.3f}")

print("\n" + "=" * 60)
print("✓ Advanced demonstration completed!")
print("=" * 60)
