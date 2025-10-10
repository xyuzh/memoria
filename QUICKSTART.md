# Memoria Quick Start Guide

Get started with Memoria in 5 minutes!

## Installation

```bash
pip install memoria-agent
```

Or install from source:

```bash
git clone https://github.com/memoria/memoria-agent.git
cd memoria-agent
pip install -e .
```

## Basic Usage

### 1. Initialize the Framework

```python
from memoria import MemoryFramework

# Use default configuration
memory = MemoryFramework()
```

### 2. Add Memories

```python
# Add an episodic memory (specific event)
memory.add_episodic(
    content="User prefers dark mode for the interface",
    tags=["preference", "ui"],
    keywords=["dark-mode", "theme"]
)

# Add semantic memory (general knowledge)
memory.add_semantic(
    content="Python is a high-level programming language",
    entity="Python",
    keywords=["python", "programming"]
)

# Add procedural memory (workflow)
memory.add_procedural(
    content="Standard code review workflow",
    workflow_name="code_review",
    steps=[
        {"step": 1, "action": "Check code style"},
        {"step": 2, "action": "Review logic"},
        {"step": 3, "action": "Test coverage"}
    ]
)
```

### 3. Retrieve Memories

```python
# Retrieve relevant memories
results = memory.retrieve(
    query="How does the user want the UI to look?",
    k=5
)

for mem in results:
    print(f"[{mem.memory_type}] {mem.content}")
```

### 4. Generate Context

```python
# Get optimized context for your query
context = memory.get_context_window(
    query="Help me with Python development",
    max_tokens=2000
)

print(context)
```

## Advanced Features

### Custom Configuration

```python
from memoria import MemoryFramework, MemoriaConfig

config = MemoriaConfig(
    max_context_window=128000,
    enable_zettelkasten=True,      # Auto-link related memories
    enable_reflection=True,         # Self-improving contexts
    retrieval_strategy="hybrid",    # Combine semantic + keyword
    enable_consolidation=True,      # Auto-create knowledge from interactions
)

memory = MemoryFramework(config=config)
```

### Different Retrieval Strategies

```python
# Semantic search (embedding-based)
results = memory.retrieve("authentication", retrieval_strategy="semantic")

# Keyword search
results = memory.retrieve("authentication security", retrieval_strategy="keyword")

# Hybrid (default - combines both)
results = memory.retrieve("authentication", retrieval_strategy="hybrid")

# Graph traversal (Zettelkasten network)
results = memory.retrieve("authentication", retrieval_strategy="graph")
```

### Memory Management

```python
# Check statistics
stats = memory.get_statistics()
print(f"Total memories: {stats['total_memories']}")
print(f"Zettelkasten links: {stats['total_links']}")

# Manually trigger consolidation
consolidated = memory.consolidate_memories()
print(f"Created {len(consolidated)} semantic memories")

# Apply memory decay
memory.apply_decay()

# Run reflection cycle
reflection = memory.reflect_and_curate()
```

### Pin Important Memories

```python
# Add and pin a critical memory
mem_id = memory.add_semantic(
    content="API key should never be committed to git",
    keywords=["security", "best-practice"],
    tags=["critical"]
)

# Prevent it from being pruned
memory.memories[mem_id].pinned = True
```

## Real-World Example

```python
from memoria import MemoryFramework

# Initialize
memory = MemoryFramework(
    enable_zettelkasten=True,
    enable_consolidation=True
)

# Simulate a coding session
memory.add_episodic(
    content="User is building a REST API for e-commerce",
    tags=["project", "context"],
    keywords=["rest", "api", "ecommerce"]
)

memory.add_episodic(
    content="User asked about JWT authentication",
    tags=["question", "security"],
    keywords=["jwt", "authentication", "security"]
)

memory.add_procedural(
    content="Implement JWT authentication in Express.js",
    workflow_name="jwt_express_auth",
    steps=[
        {"step": 1, "action": "Install jsonwebtoken package"},
        {"step": 2, "action": "Create auth middleware"},
        {"step": 3, "action": "Generate tokens on login"},
        {"step": 4, "action": "Verify tokens on protected routes"}
    ]
)

# Later, retrieve relevant information
context = memory.get_context_window(
    query="How should I implement authentication?",
    max_tokens=1500
)

print("=== Relevant Context ===")
print(context)
```

## Key Features at a Glance

| Feature | Description |
|---------|-------------|
| **Multi-Tier Memory** | Episodic, Semantic, Procedural, Core, Knowledge Vault |
| **Zettelkasten Network** | Auto-linking creates knowledge graph |
| **Hybrid Retrieval** | Semantic + keyword + graph traversal |
| **Agentic Context** | Evolving playbooks with reflection |
| **Smart Consolidation** | Auto-distill knowledge from interactions |
| **Intelligent Decay** | Importance-based memory lifecycle |
| **Production-Ready** | Configurable, tested, documented |

## Next Steps

- Read the [Architecture Guide](docs/ARCHITECTURE.md) for design details
- Check the [API Reference](docs/API.md) for complete API documentation
- Explore [Examples](examples/) for advanced usage patterns
- Review [Research Summary](docs/RESEARCH_SUMMARY.md) for theoretical foundations

## Common Patterns

### For Chatbots

```python
# Store conversation history
memory.add_episodic(content=user_message, tags=["conversation"])
memory.add_episodic(content=bot_response, tags=["conversation"])

# Retrieve relevant context for next response
context = memory.get_context_window(query=new_user_message, max_tokens=2000)
```

### For Code Assistants

```python
# Store project context
memory.add_semantic(content="Project uses FastAPI framework", entity="Project")

# Store workflows
memory.add_procedural(
    content="Testing workflow",
    workflow_name="run_tests",
    steps=[...]
)

# Retrieve when helping with tasks
relevant = memory.retrieve("How to add a new endpoint?", k=5)
```

### For Personal Assistants

```python
# Store user preferences
memory.add_episodic(content="User prefers morning meetings", tags=["preference"])

# Store knowledge
memory.add_semantic(content="User's timezone is PST", entity="User")

# Query for personalized responses
prefs = memory.retrieve("scheduling preferences", memory_types=[MemoryType.EPISODIC])
```

## Need Help?

- GitHub Issues: [github.com/memoria/memoria-agent/issues](https://github.com/memoria/memoria-agent/issues)
- Documentation: [docs.memoria.ai](https://docs.memoria.ai)
- Examples: See `/examples` directory

Happy building with Memoria!
