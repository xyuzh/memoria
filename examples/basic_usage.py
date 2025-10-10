"""
Basic usage example for Memoria framework.

Demonstrates:
- Initializing the framework
- Adding different types of memories
- Retrieving memories with various strategies
- Using context engineering
"""

from memoria import MemoryFramework, MemoriaConfig

# Initialize with custom configuration
config = MemoriaConfig(
    max_context_window=128000,
    enable_zettelkasten=True,
    enable_reflection=True,
    retrieval_strategy="hybrid",
)

memory = MemoryFramework(config=config)

# Add episodic memories (specific interactions)
print("Adding episodic memories...")
memory.add_episodic(
    content="User mentioned they prefer Python over JavaScript for backend development",
    tags=["preference", "programming"],
    keywords=["python", "javascript", "backend"],
    context="Discussion about technology stack choices",
)

memory.add_episodic(
    content="User successfully completed the authentication module using JWT tokens",
    tags=["achievement", "programming"],
    keywords=["authentication", "jwt", "security"],
    context="Working on user authentication feature",
)

memory.add_episodic(
    content="User is building a REST API for a social media application",
    tags=["project", "context"],
    keywords=["rest", "api", "social-media"],
    context="Project context discussion",
)

# Add semantic memories (general knowledge)
print("\nAdding semantic memories...")
memory.add_semantic(
    content="Python is a high-level programming language known for readability",
    entity="Python",
    keywords=["python", "programming-language"],
    tags=["knowledge", "technology"],
)

memory.add_semantic(
    content="JWT (JSON Web Token) is a standard for securely transmitting information",
    entity="JWT",
    keywords=["jwt", "security", "authentication"],
    tags=["knowledge", "security"],
)

# Add procedural memories (workflows)
print("\nAdding procedural memories...")
memory.add_procedural(
    content="Standard workflow for implementing authentication in a REST API",
    workflow_name="implement_authentication",
    steps=[
        {"step": 1, "action": "Design user model with credentials"},
        {"step": 2, "action": "Implement password hashing"},
        {"step": 3, "action": "Create JWT token generation"},
        {"step": 4, "action": "Add authentication middleware"},
        {"step": 5, "action": "Test with various scenarios"},
    ],
    keywords=["authentication", "workflow", "rest-api"],
    tags=["procedure", "security"],
)

# Retrieve memories with different strategies
print("\n" + "=" * 60)
print("RETRIEVAL EXAMPLES")
print("=" * 60)

# Semantic retrieval
print("\n1. Semantic retrieval: 'How to secure my API?'")
results = memory.retrieve(
    query="How to secure my API?",
    k=3,
    retrieval_strategy="semantic",
)
for i, mem in enumerate(results, 1):
    print(f"   {i}. [{mem.memory_type}] {mem.content[:80]}...")

# Hybrid retrieval
print("\n2. Hybrid retrieval: 'Python backend development'")
results = memory.retrieve(
    query="Python backend development",
    k=3,
    retrieval_strategy="hybrid",
)
for i, mem in enumerate(results, 1):
    print(f"   {i}. [{mem.memory_type}] {mem.content[:80]}...")

# Keyword retrieval
print("\n3. Keyword retrieval: ['authentication', 'security']")
results = memory.retrieve(
    query="authentication security",
    k=3,
    retrieval_strategy="keyword",
)
for i, mem in enumerate(results, 1):
    print(f"   {i}. [{mem.memory_type}] {mem.content[:80]}...")

# Generate optimized context window
print("\n" + "=" * 60)
print("CONTEXT WINDOW GENERATION")
print("=" * 60)

context = memory.get_context_window(
    query="Help me with authentication implementation",
    max_tokens=1000,
    strategy="hybrid",
)
print(context)

# View statistics
print("\n" + "=" * 60)
print("FRAMEWORK STATISTICS")
print("=" * 60)

stats = memory.get_statistics()
print(f"Total memories: {stats['total_memories']}")
print(f"By type: {stats['by_type']}")
print(f"Total Zettelkasten links: {stats['total_links']}")
print(f"Average importance: {stats['avg_importance']:.2f}")

# Demonstrate reflection and curation
print("\n" + "=" * 60)
print("REFLECTION AND CURATION")
print("=" * 60)

reflection_results = memory.reflect_and_curate()
print(f"Reflection completed. Results: {reflection_results}")

print("\n✓ Basic usage example completed!")
