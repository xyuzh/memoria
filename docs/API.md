# Memoria API Reference

## MemoryFramework

Main interface for the memory framework.

### Initialization

```python
from memoria import MemoryFramework, MemoriaConfig

# Use default configuration
memory = MemoryFramework()

# Use custom configuration
config = MemoriaConfig(
    max_context_window=128000,
    enable_zettelkasten=True,
    retrieval_strategy="hybrid"
)
memory = MemoryFramework(config=config)

# Or pass kwargs directly
memory = MemoryFramework(
    max_context_window=128000,
    enable_zettelkasten=True
)
```

### Adding Memories

#### add_episodic()
Add an episodic (event-based) memory.

```python
memory_id = memory.add_episodic(
    content: str,                    # Required: memory content
    tags: List[str] = None,         # Optional: categorical tags
    keywords: List[str] = None,     # Optional: indexing keywords
    context: str = "",              # Optional: contextual description
    session_id: str = None,         # Optional: session identifier
    turn_number: int = None,        # Optional: conversation turn
    **kwargs                        # Additional memory attributes
) -> UUID
```

**Example:**
```python
mem_id = memory.add_episodic(
    content="User prefers dark mode for the UI",
    tags=["preference", "ui"],
    keywords=["dark-mode", "theme", "ui"],
    context="Discussion about application appearance"
)
```

#### add_semantic()
Add semantic (knowledge-based) memory.

```python
memory_id = memory.add_semantic(
    content: str,                    # Required: knowledge content
    entity: str = None,             # Optional: primary entity/concept
    keywords: List[str] = None,     # Optional: indexing keywords
    tags: List[str] = None,         # Optional: categorical tags
    **kwargs
) -> UUID
```

**Example:**
```python
mem_id = memory.add_semantic(
    content="REST APIs use HTTP methods for CRUD operations",
    entity="REST API",
    keywords=["rest", "api", "http", "crud"],
    tags=["knowledge", "web-development"]
)
```

#### add_procedural()
Add procedural (workflow) memory.

```python
memory_id = memory.add_procedural(
    content: str,                           # Required: workflow description
    workflow_name: str,                     # Required: workflow identifier
    steps: List[Dict[str, Any]],           # Required: workflow steps
    preconditions: List[str] = None,       # Optional: when to use
    expected_outcomes: List[str] = None,   # Optional: expected results
    **kwargs
) -> UUID
```

**Example:**
```python
mem_id = memory.add_procedural(
    content="Standard Git workflow for feature development",
    workflow_name="git_feature_workflow",
    steps=[
        {"step": 1, "action": "Create feature branch"},
        {"step": 2, "action": "Make changes and commit"},
        {"step": 3, "action": "Push and create PR"},
        {"step": 4, "action": "Review and merge"}
    ],
    preconditions=["Working on new feature", "Using Git"],
    expected_outcomes=["Feature merged to main branch"]
)
```

### Retrieving Memories

#### retrieve()
Retrieve relevant memories using various strategies.

```python
memories = memory.retrieve(
    query: str,                              # Required: search query
    k: int = 5,                             # Number of results
    retrieval_strategy: str = None,         # Strategy: semantic, keyword, hybrid, graph
    memory_types: List[MemoryType] = None   # Filter by memory types
) -> List[Memory]
```

**Strategies:**
- `"semantic"`: Embedding-based similarity search
- `"keyword"`: Keyword/tag matching
- `"hybrid"`: Combination of semantic + keyword (default)
- `"graph"`: Zettelkasten network traversal

**Example:**
```python
# Hybrid retrieval (default)
results = memory.retrieve("How to implement authentication?", k=5)

# Semantic only
results = memory.retrieve(
    "authentication security",
    k=10,
    retrieval_strategy="semantic"
)

# Filter by type
from memoria.core.memory_types import MemoryType
results = memory.retrieve(
    "Python workflows",
    k=5,
    memory_types=[MemoryType.PROCEDURAL]
)
```

### Context Engineering

#### get_context_window()
Generate optimized context for a query within token budget.

```python
context_str = memory.get_context_window(
    query: str,              # Required: context query
    max_tokens: int = 4000,  # Maximum token budget
    strategy: str = None     # Curation strategy: importance, recency, hybrid
) -> str
```

**Example:**
```python
context = memory.get_context_window(
    query="Help with Python API development",
    max_tokens=2000,
    strategy="hybrid"
)
print(context)
```

#### reflect_and_curate()
Run reflection and curation cycle on context playbooks.

```python
results = memory.reflect_and_curate() -> Dict[str, Any]
```

**Example:**
```python
reflection = memory.reflect_and_curate()
for playbook_name, insights in reflection.items():
    print(f"{playbook_name}: {insights}")
```

### Memory Management

#### consolidate_memories()
Manually trigger consolidation of episodic to semantic memories.

```python
new_semantic = memory.consolidate_memories() -> List[SemanticMemory]
```

**Example:**
```python
consolidated = memory.consolidate_memories()
print(f"Created {len(consolidated)} semantic memories")
```

#### apply_decay()
Manually apply intelligent decay to all memories.

```python
memory.apply_decay()
```

#### get_statistics()
Get framework statistics and metrics.

```python
stats = memory.get_statistics() -> Dict[str, Any]
```

**Returns:**
```python
{
    "total_memories": 150,
    "by_type": {
        "episodic": 80,
        "semantic": 50,
        "procedural": 20,
        ...
    },
    "total_links": 245,
    "avg_importance": 0.65,
    "last_decay": "2025-10-10T12:00:00",
    "last_consolidation": "2025-10-10T11:30:00"
}
```

## MemoriaConfig

Configuration class for the framework.

### Key Parameters

```python
config = MemoriaConfig(
    # Model Configuration
    model_name: str = "gpt-4",
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
    max_context_window: int = 128000,

    # Memory Limits
    max_episodic_memories: int = 1000,
    max_semantic_memories: int = 500,
    max_procedural_memories: int = 200,

    # Zettelkasten Network
    enable_zettelkasten: bool = True,
    linking_threshold: float = 0.75,      # 0.0 - 1.0
    max_links_per_memory: int = 10,

    # Context Engineering
    enable_reflection: bool = True,
    reflection_interval_hours: float = 24.0,
    curation_strategy: str = "importance",  # importance, recency, hybrid

    # Retrieval
    default_retrieval_k: int = 5,
    retrieval_strategy: str = "hybrid",     # semantic, keyword, hybrid, graph
    semantic_weight: float = 0.7,           # 0.0 - 1.0

    # Consolidation
    enable_consolidation: bool = True,
    consolidation_threshold: int = 50,

    # Decay and Pruning
    enable_decay: bool = True,
    decay_interval_hours: float = 1.0,
    pruning_threshold: float = 0.1,         # 0.0 - 1.0

    # Storage
    storage_backend: str = "chromadb",      # chromadb, sqlite, memory
    storage_path: str = None,

    # Performance
    batch_size: int = 32,
    enable_caching: bool = True,
)
```

## Memory Types

### Memory (Base Class)

Base memory with Zettelkasten attributes.

**Attributes:**
```python
id: UUID                         # Unique identifier
content: str                     # Memory content
memory_type: MemoryType         # Type of memory
keywords: List[str]             # Indexing keywords
tags: List[str]                 # Categorical tags
context: str                    # Contextual description
timestamp: datetime             # Creation time
access_count: int               # Number of accesses
last_accessed: datetime         # Last access time
importance_score: float         # 0.0 - 1.0
links_to: Set[UUID]            # Outgoing links
linked_from: Set[UUID]         # Incoming links
decay_rate: float              # Decay rate
pinned: bool                    # Prevent pruning
embedding: List[float]         # Semantic embedding
metadata: Dict[str, Any]       # Custom metadata
```

**Methods:**
```python
memory.update_access()                                    # Update access stats
memory.apply_decay(time_delta_hours: float)              # Apply decay
memory.compute_relevance(query_embedding, recency_weight) # Compute relevance
```

### EpisodicMemory

Event-based memory with temporal context.

**Additional Attributes:**
```python
session_id: str                           # Session identifier
turn_number: int                          # Conversation turn
previous_episode: UUID                    # Previous in sequence
next_episode: UUID                        # Next in sequence
conversation_context: List[Dict[str, str]] # Surrounding context
```

### SemanticMemory

Knowledge-based memory with entity relationships.

**Additional Attributes:**
```python
entity: str                      # Primary entity/concept
relationships: Dict[str, List[str]]  # Entity relationships
source_episodes: Set[UUID]       # Source episodic memories
confidence: float                # Confidence score (0.0 - 1.0)
last_consolidated: datetime      # Last consolidation time
```

### ProceduralMemory

Workflow/strategy memory with execution tracking.

**Additional Attributes:**
```python
workflow_name: str                    # Workflow identifier
steps: List[Dict[str, Any]]          # Workflow steps
execution_count: int                 # Times executed
success_count: int                   # Successful executions
preconditions: List[str]            # When to use
expected_outcomes: List[str]        # Expected results
```

**Methods:**
```python
workflow.success_rate -> float              # Calculate success rate
workflow.record_execution(success: bool)    # Record execution
```

## Context Engine

### ContextPlaybook

Evolving strategy playbook (ACE implementation).

```python
from memoria.core.context_engine import ContextPlaybook

playbook = ContextPlaybook(
    name: str,
    description: str = ""
)

# Add strategies
playbook.add_strategy({
    "name": "strategy_name",
    "steps": [...],
    "conditions": [...]
})

# Record execution
playbook.record_execution(
    strategy_name: str,
    outcome: Dict[str, Any]
)

# Reflect on performance
reflection = playbook.reflect() -> Dict[str, Any]

# Curate based on reflection
playbook.curate(reflection)
```

## Advanced Usage

### Custom Memory Types

```python
from memoria.core.memory_types import Memory, MemoryType

class CustomMemory(Memory):
    memory_type: MemoryType = MemoryType.CORE
    custom_field: str = ""

    def custom_method(self):
        # Custom logic
        pass
```

### Direct Memory Access

```python
# Access memory by ID
memory_obj = memory.memories[memory_id]

# Modify memory
memory_obj.importance_score = 0.9
memory_obj.pinned = True

# Access by type
episodic_ids = memory._memories_by_type[MemoryType.EPISODIC]
```

### Manual Linking

```python
# Create manual links
memory1 = memory.memories[id1]
memory2 = memory.memories[id2]

memory1.links_to.add(id2)
memory2.linked_from.add(id1)
```

## Error Handling

```python
from memoria import MemoryFramework

try:
    memory = MemoryFramework(embedding_model="invalid-model")
except Exception as e:
    print(f"Initialization failed: {e}")

try:
    results = memory.retrieve("query", retrieval_strategy="unknown")
except ValueError as e:
    print(f"Invalid strategy: {e}")
```

## Best Practices

1. **Use appropriate memory types**: Episodic for interactions, semantic for knowledge, procedural for workflows

2. **Provide rich metadata**: Keywords and tags improve retrieval quality

3. **Enable Zettelkasten**: Auto-linking creates a powerful knowledge graph

4. **Regular reflection**: Enable reflection for self-improving contexts

5. **Monitor statistics**: Use `get_statistics()` to track memory health

6. **Pin important memories**: Prevent critical information from being pruned

7. **Tune retrieval strategy**: Experiment with semantic weights and strategies

8. **Set appropriate limits**: Configure memory limits based on your use case
