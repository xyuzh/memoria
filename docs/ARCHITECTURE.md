# Memoria Architecture

## Overview

Memoria is a next-generation memory framework for LLM agents that synthesizes cutting-edge research from multiple arXiv papers published in 2024-2025.

## Research Foundations

### Key Papers

1. **A-MEM: Agentic Memory for LLM Agents** (arXiv:2502.12110)
   - Zettelkasten-inspired dynamic memory organization
   - Interconnected knowledge networks
   - Dynamic indexing and linking

2. **Agentic Context Engineering (ACE)** (arXiv:2510.04618)
   - Evolving contexts as playbooks
   - Generation, reflection, and curation cycles
   - Prevention of context collapse

3. **MIRIX: Multi-Agent Memory System** (arXiv:2507.07957)
   - Six-component memory architecture
   - Specialized memory managers
   - 35% improvement over RAG baselines

4. **Agentic RAG** (arXiv:2501.09136)
   - Dynamic retrieval with autonomous agents
   - Reflection and planning patterns
   - Iterative refinement

5. **Context Engineering Survey** (arXiv:2507.13334)
   - Systematic taxonomy of context optimization
   - Foundational components and implementations

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MemoryFramework                          │
│                    (Main Interface)                         │
└───────────────┬─────────────────────────────────────────────┘
                │
    ┌───────────┼───────────┬──────────────┬─────────────┐
    │           │           │              │             │
┌───▼────┐  ┌──▼────┐  ┌───▼──────┐  ┌────▼─────┐  ┌──▼──────┐
│ Memory │  │Context│  │Retriever │  │Consolid- │  │Storage  │
│ Types  │  │Engine │  │          │  │ator      │  │Backend  │
└────────┘  └───────┘  └──────────┘  └──────────┘  └─────────┘
```

## Core Components

### 1. Memory Types

Implements multi-tier memory architecture inspired by MIRIX:

#### Episodic Memory
- **Purpose**: Time-indexed interaction history
- **Structure**: Chronological events with full context
- **Use Cases**: Recent conversations, specific interactions
- **Consolidation**: Source material for semantic memory

```python
EpisodicMemory(
    content="User mentioned preference for Python",
    timestamp=datetime.utcnow(),
    session_id="session_123",
    turn_number=5,
    conversation_context=[...],
)
```

#### Semantic Memory
- **Purpose**: Distilled knowledge and generalizations
- **Structure**: Entity-relationship graph
- **Use Cases**: Facts, concepts, learned patterns
- **Source**: Consolidated from episodic memories

```python
SemanticMemory(
    content="Python is a high-level language",
    entity="Python",
    relationships={"is_a": ["programming-language"]},
    source_episodes={uuid1, uuid2, ...},
    confidence=0.9,
)
```

#### Procedural Memory
- **Purpose**: Workflows, strategies, and how-to knowledge
- **Structure**: Step-by-step procedures with conditions
- **Use Cases**: Task execution patterns, successful strategies
- **Tracking**: Success rates and execution history

```python
ProceduralMemory(
    workflow_name="implement_authentication",
    steps=[
        {"step": 1, "action": "Design user model"},
        {"step": 2, "action": "Implement hashing"},
        ...
    ],
    success_rate=0.85,
)
```

#### Core Memory (Working Memory)
- **Purpose**: Active context window
- **Structure**: Currently relevant information
- **Use Cases**: Ongoing conversation, immediate tasks

#### Knowledge Vault
- **Purpose**: Long-term persistent storage
- **Structure**: Archived important information
- **Use Cases**: Reference materials, historical data

### 2. Zettelkasten Network

Implements A-MEM's dynamic knowledge network:

#### Memory Attributes
Each memory has Zettelkasten-inspired attributes:
- **Content**: The actual information
- **Keywords**: Indexing terms for retrieval
- **Tags**: Categorical labels
- **Context**: Contextual description
- **Links**: Bidirectional connections to related memories

#### Auto-Linking
Memories are automatically linked based on:
- **Semantic similarity** (via embeddings)
- **Keyword overlap**
- **Importance scores**
- **Configurable threshold** (default: 0.75)

```python
# Automatic linking when adding memory
memory.add_episodic(content="...")
# Framework auto-creates links to related memories
```

#### Graph Traversal
Retrieval via network navigation:
- **Seed Selection**: Find initial relevant memories
- **BFS Traversal**: Explore connected memories
- **Depth Control**: Configurable max depth
- **Importance Ranking**: Sort by relevance

### 3. Context Engineering (ACE)

Implements evolving context playbooks:

#### Context Playbooks
- **Accumulation**: Gather strategies over time
- **Reflection**: Analyze execution outcomes
- **Curation**: Refine based on performance

```python
playbook = memory.context_engine.create_playbook("code_review")
playbook.add_strategy({...})
playbook.record_execution("strategy_name", outcome={...})
reflection = playbook.reflect()
playbook.curate(reflection)
```

#### Context Window Optimization
- **Token Budget**: Respect model context limits
- **Curation Strategies**:
  - Importance-based
  - Recency-based
  - Hybrid (combines both)
- **Compression**: Structured summarization

#### Reflection Cycles
- **Interval-Based**: Configurable reflection frequency
- **Performance Analysis**: Track strategy success rates
- **Adaptive Improvement**: Remove low-performing patterns

### 4. Retrieval System

Multi-strategy retrieval inspired by Agentic RAG:

#### Semantic Retrieval
- **Method**: Embedding-based similarity search
- **Scoring**: Combines semantic similarity, recency, importance
- **Embeddings**: Via sentence-transformers

#### Keyword Retrieval
- **Method**: Exact and fuzzy keyword matching
- **Scope**: Keywords, tags, content
- **Scoring**: Match count + importance

#### Graph Retrieval
- **Method**: Zettelkasten network traversal
- **Starting Point**: Seed memories from semantic search
- **Navigation**: Follow memory links

#### Hybrid Retrieval
- **Method**: Fusion of semantic and keyword approaches
- **Weighting**: Configurable balance (default: 70% semantic)
- **Ranking**: Combined relevance scores

#### Agentic Retrieval with Reflection
- **Initial Retrieval**: Standard strategy
- **Analysis**: Examine results for themes
- **Refinement**: Generate improved query
- **Iteration**: Multiple refinement cycles

### 5. Memory Consolidation

Automatic episodic-to-semantic consolidation:

#### Cluster Identification
- **Method**: Group related episodic memories
- **Criteria**: Shared keywords, tags, entities
- **Threshold**: Minimum cluster size (default: 3)

#### Pattern Extraction
- **Frequency Analysis**: Most common keywords/tags
- **Entity Recognition**: Identify key concepts
- **Temporal Analysis**: Time span of cluster

#### Knowledge Synthesis
- **Consolidation**: Create semantic memory from cluster
- **Confidence**: Based on cluster size and consistency
- **Linking**: Maintain references to source episodes

#### Trigger Conditions
- **Threshold**: Number of episodic memories (default: 50)
- **Manual**: On-demand consolidation
- **Automatic**: Triggered during memory addition

### 6. Intelligent Decay & Pruning

Memory lifecycle management:

#### Decay Mechanism
- **Time-Based**: Importance decays over time
- **Access-Boosting**: Recent access increases importance
- **Access Factor**: Frequent access slows decay
- **Pinning**: Prevent decay for critical memories

```python
# Decay formula
decay = decay_rate × time_delta × access_factor
importance_new = max(0, importance_old - decay)

# Access boost
importance_new = min(1.0, importance_old + 0.05)
```

#### Pruning Strategy
- **Limits**: Type-specific memory limits
- **Criteria**: Importance below threshold (default: 0.1)
- **Protection**: Pinned memories never pruned
- **Link Cleanup**: Remove dangling references

## Data Flow

### Adding Memory
```
1. Create memory object with attributes
2. Generate embedding (if model available)
3. Add to memory store
4. Auto-link to related memories (Zettelkasten)
5. Check consolidation trigger
6. Check memory limits (prune if needed)
```

### Retrieving Memory
```
1. Parse query (generate embedding, extract keywords)
2. Select retrieval strategy
3. Execute strategy:
   - Semantic: Embedding similarity
   - Keyword: Term matching
   - Hybrid: Combined scoring
   - Graph: Network traversal
4. Rank results
5. Update access statistics
6. Return top-k memories
```

### Reflection Cycle
```
1. Check reflection interval
2. Apply decay to all memories
3. Analyze playbook execution history
4. Generate insights and recommendations
5. Curate playbooks (remove low performers)
6. Update version and timestamp
```

## Performance Optimizations

### Embedding Caching
- Cache embeddings to avoid recomputation
- Configurable cache strategy

### Batch Processing
- Batch embedding generation
- Configurable batch size (default: 32)

### Lazy Graph Building
- Build Zettelkasten graph on-demand
- Cache for repeated queries

### Pruning Strategy
- Remove lowest importance first
- Respect memory type limits
- Clean up orphaned links

## Configuration

See `MemoriaConfig` class for all configurable parameters:

- **Model settings**: LLM and embedding models
- **Memory limits**: Type-specific maximums
- **Zettelkasten**: Linking thresholds and limits
- **Context engineering**: Reflection intervals, curation strategies
- **Retrieval**: Default strategies and weights
- **Consolidation**: Thresholds and triggers
- **Decay**: Intervals and pruning thresholds
- **Storage**: Backend selection and paths

## Extensibility

The framework is designed for extension:

- **Custom Memory Types**: Subclass `Memory`
- **Custom Retrieval**: Extend `MemoryRetriever`
- **Custom Storage**: Implement storage backend interface
- **Custom Consolidation**: Override `MemoryConsolidator` methods
- **Custom Playbooks**: Create domain-specific strategies

## Research Alignment

| Feature | Research Paper | Implementation |
|---------|---------------|----------------|
| Dynamic Linking | A-MEM | Zettelkasten network |
| Memory Types | MIRIX | 6-tier architecture |
| Context Optimization | ACE | Playbooks + reflection |
| Hybrid Retrieval | Agentic RAG | Multi-strategy retrieval |
| Consolidation | Neuroscience | Episodic → Semantic |
| Decay Mechanism | Memory Research | Intelligent pruning |

## Next Steps

See:
- [API Reference](API.md) for detailed API documentation
- [Examples](../examples/) for usage examples
- [Performance Guide](PERFORMANCE.md) for optimization tips
