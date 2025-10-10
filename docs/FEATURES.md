# Memoria Features

## Core Features

### 1. Multi-Tier Memory Architecture

Inspired by MIRIX (arXiv:2507.07957), Memoria implements a comprehensive memory hierarchy:

```
┌─────────────────────────────────────────────────────┐
│                  Core Memory                        │
│              (Working Context)                      │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌─────▼─────┐ ┌───────▼────────┐
│  Episodic    │ │ Semantic  │ │  Procedural    │
│   Memory     │ │  Memory   │ │    Memory      │
│              │ │           │ │                │
│ Time-indexed │ │ Knowledge │ │  Workflows &   │
│ interactions │ │ & facts   │ │  strategies    │
└──────────────┘ └───────────┘ └────────────────┘
                        │
                ┌───────▼────────┐
                │ Knowledge Vault│
                │   (Archive)    │
                └────────────────┘
```

**Benefits:**
- Organized information storage
- Efficient retrieval by type
- Specialized processing per type
- Natural memory lifecycle

### 2. Zettelkasten Knowledge Network

Inspired by A-MEM (arXiv:2502.12110), creates interconnected knowledge graphs:

```
    Memory A ──────┐
       │           │
       │           ▼
       │       Memory B
       │           │
       ▼           │
    Memory C ◄─────┘
       │
       │
       ▼
    Memory D
```

**Features:**
- Auto-linking based on semantic similarity
- Bidirectional connections
- Graph traversal retrieval
- Network-based knowledge discovery

**Use Cases:**
- Discovering related concepts
- Following knowledge trails
- Building conceptual understanding
- Context expansion

### 3. Agentic Context Engineering (ACE)

Based on ACE (arXiv:2510.04618), evolving context playbooks:

```
┌─────────────────────────────────────────────┐
│           Context Playbook                  │
│                                             │
│  ┌──────────┐   ┌──────────┐              │
│  │Strategy 1│   │Strategy 2│   ...        │
│  └──────────┘   └──────────┘              │
│                                             │
│  Execution History:                        │
│  - Strategy 1: 85% success (10 runs)      │
│  - Strategy 2: 40% success (5 runs)       │
└─────────────────────────────────────────────┘
         │
         ▼
   ┌──────────┐      ┌──────────┐
   │ Reflect  │─────▶│  Curate  │
   └──────────┘      └──────────┘
         │                 │
         │                 ▼
         │         Remove Strategy 2
         │         Promote Strategy 1
         ▼
   Insights & Recommendations
```

**Benefits:**
- Self-improving strategies
- Performance-based curation
- Adaptive learning
- Prevention of context collapse

### 4. Hybrid Retrieval System

Multi-strategy retrieval inspired by Agentic RAG (arXiv:2501.09136):

#### Semantic Retrieval
```
Query: "How to implement authentication?"
  │
  ▼
Generate Embedding
  │
  ▼
Compute Similarity with All Memories
  │
  ▼
Rank by: Similarity × 0.7 + Recency × 0.2 + Importance × 0.1
  │
  ▼
Return Top K
```

#### Keyword Retrieval
```
Query: "authentication security"
  │
  ▼
Extract Keywords: ["authentication", "security"]
  │
  ▼
Match Against Memory Keywords & Tags
  │
  ▼
Rank by: Match Count × 0.6 + Importance × 0.4
  │
  ▼
Return Top K
```

#### Graph Retrieval
```
Query: "Python programming"
  │
  ▼
Find Seed Memories (Semantic Search)
  │
  ▼
BFS Traversal of Zettelkasten Network
  │
  ▼
Collect Connected Memories (Max Depth = 2)
  │
  ▼
Rank by Importance
  │
  ▼
Return Top K
```

#### Hybrid Strategy
```
Query → [Semantic Results] + [Keyword Results]
           ↓                      ↓
      Weight: 0.7           Weight: 0.3
           ↓                      ↓
           └──────────┬───────────┘
                      ▼
              Combined Ranking
                      ▼
                  Top K Results
```

### 5. Memory Consolidation

Automatic episodic → semantic consolidation:

```
Episodic Memories (Time-indexed events)
  │
  ├─ "User asked about Python"
  ├─ "User used Python for project"
  ├─ "User prefers Python over Java"
  ├─ "User mentioned Python readability"
  └─ "User learning Python async"
  │
  ▼
Identify Clusters (Related memories)
  │
  ▼
Extract Patterns
  - Keywords: python, programming, language
  - Entities: Python
  - Theme: User interest in Python
  │
  ▼
Create Semantic Memory
  "User is actively learning and using Python,
   values its readability and async features"
  │
  ▼
Confidence: 0.85 (based on 5 episodes)
Source Episodes: [id1, id2, id3, id4, id5]
```

**Benefits:**
- Reduced memory footprint
- Generalized knowledge
- Pattern recognition
- Efficient long-term storage

### 6. Intelligent Decay & Pruning

Smart memory lifecycle management:

```
Memory Importance Over Time

1.0 │        Access!
    │           ▲
    │          │ │
0.8 │         │  │
    │        │   │─── Pinned Memory (No Decay)
0.6 │       │    │
    │      │     └─────────────────
0.4 │     │
    │    │  Normal Memory
0.2 │   │   (Gradual Decay)
    │  │
0.0 │─┴────────────────────────────▶ Time
    0   1d   2d   3d   4d   5d   6d

Pruning Threshold ─ ─ ─ ─ ─ ─ ─ ─
```

**Decay Formula:**
```python
# Access factor slows decay for frequently accessed memories
access_factor = 1.0 / (1.0 + access_count × 0.1)

# Time-based decay
decay = decay_rate × time_delta × access_factor

# New importance
importance_new = max(0, importance_old - decay)
```

**Access Boost:**
```python
# Accessing memory increases importance
importance_new = min(1.0, importance_old + 0.05)
```

**Pruning Rules:**
- Remove memories below threshold (default: 0.1)
- Never prune pinned memories
- Respect type-specific limits
- Clean up dangling links

### 7. Context Window Optimization

Smart context generation within token budgets:

```
Available Memories (1000+)
  │
  ▼
Retrieve Relevant Subset (50)
  │
  ▼
Apply Curation Strategy:
  - Importance: Sort by importance_score
  - Recency: Sort by timestamp
  - Hybrid: Combined scoring
  │
  ▼
Fill Token Budget (4000 tokens)
  │
  ├─ Semantic Memory 1 (500 tokens)
  ├─ Procedural Memory 1 (800 tokens)
  ├─ Episodic Memory 1 (300 tokens)
  ├─ Semantic Memory 2 (600 tokens)
  └─ ... until budget full
  │
  ▼
Compress & Format
  │
  ▼
## Key Knowledge
- Fact 1
- Fact 2

## Available Strategies
- Workflow 1

## Recent Context
- Event 1
- Event 2
```

## Advanced Features

### 8. Reflection Cycles

Periodic self-assessment and improvement:

```
Every 24 hours (configurable):
  │
  ▼
Apply Decay to All Memories
  │
  ▼
Analyze Playbook Performance
  │
  ├─ Strategy A: 90% success → Keep & Promote
  ├─ Strategy B: 85% success → Keep
  ├─ Strategy C: 25% success → Remove
  └─ Strategy D: 50% success → Keep but Monitor
  │
  ▼
Generate Insights
  - "Strategy A highly effective for code review"
  - "Strategy C needs improvement or replacement"
  │
  ▼
Curate Playbooks
  - Remove low performers
  - Increment version
  - Update timestamp
```

### 9. Multi-Strategy Query Processing

Adaptive query handling:

```
User Query
  │
  ▼
Analyze Query Complexity
  │
  ├─ Simple: Direct keyword match
  ├─ Moderate: Hybrid retrieval
  └─ Complex: Graph + Reflection
  │
  ▼
Execute Retrieval
  │
  ▼
Reflect on Results (if enabled)
  │
  ├─ Extract themes from top results
  ├─ Refine understanding
  └─ Re-query if needed
  │
  ▼
Return Optimized Results
```

### 10. Configurable Everything

Full control through `MemoriaConfig`:

```python
MemoriaConfig(
    # Model Settings
    model_name="gpt-4",
    embedding_model="...",
    max_context_window=128000,

    # Memory Limits
    max_episodic_memories=1000,
    max_semantic_memories=500,
    max_procedural_memories=200,

    # Zettelkasten
    enable_zettelkasten=True,
    linking_threshold=0.75,
    max_links_per_memory=10,

    # Context Engineering
    enable_reflection=True,
    reflection_interval_hours=24.0,
    curation_strategy="hybrid",

    # Retrieval
    retrieval_strategy="hybrid",
    semantic_weight=0.7,

    # Consolidation
    enable_consolidation=True,
    consolidation_threshold=50,

    # Decay & Pruning
    enable_decay=True,
    decay_interval_hours=1.0,
    pruning_threshold=0.1,

    # Storage
    storage_backend="chromadb",
    storage_path=None,
)
```

## Performance Features

### Batch Processing
- Batch embedding generation (32 items/batch)
- Reduces API calls
- Improves throughput

### Lazy Computation
- Build Zettelkasten graph on-demand
- Cache for repeated queries
- Minimize unnecessary work

### Efficient Storage
- Type-based indexing
- UUID-based lookup (O(1))
- Set-based link storage

### Smart Caching
- Embedding cache (optional)
- Query result cache (optional)
- Configuration-based control

## Integration Features

### Extensibility

```python
# Custom memory types
class CustomMemory(Memory):
    custom_field: str

    def custom_method(self):
        pass

# Custom retrieval strategies
class CustomRetriever(MemoryRetriever):
    def retrieve_custom(self, query, k):
        # Custom logic
        pass

# Custom storage backends
class CustomStorage:
    def save(self, memories):
        pass

    def load(self):
        pass
```

### API Compatibility
- Pydantic models for validation
- Type hints throughout
- Clear error messages
- Graceful degradation

### Framework Agnostic
- Works with any LLM
- Embedding model flexible
- Storage backend pluggable
- No vendor lock-in

## Summary

Memoria provides a **production-ready**, **research-based**, **extensible** memory framework for LLM agents with:

✅ Multi-tier architecture
✅ Knowledge graph networking
✅ Self-improving contexts
✅ Hybrid retrieval
✅ Smart consolidation
✅ Intelligent decay
✅ Context optimization
✅ Full configurability
✅ Comprehensive testing
✅ Rich documentation

All based on the latest research from arXiv 2024-2025.
