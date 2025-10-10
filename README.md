# Memoria: Next-Generation Agent Memory Framework

A production-ready memory framework for LLM agents based on cutting-edge research from arXiv (2024-2025).

## Overview

Memoria synthesizes the latest research in agent memory systems, context engineering, and retrieval-augmented generation to provide a comprehensive, scalable memory solution for AI agents.

## Key Research Foundations

This framework is built on insights from:

- **A-MEM** (arXiv:2502.12110): Zettelkasten-inspired dynamic memory organization
- **Agentic Context Engineering (ACE)** (arXiv:2510.04618): Evolving context playbooks with generation, reflection, and curation
- **MIRIX** (arXiv:2507.07957): Multi-agent memory system with six specialized components
- **Agentic RAG** (arXiv:2501.09136): Autonomous agent-powered retrieval with reflection and planning
- **Context Engineering Survey** (arXiv:2507.13334): Systematic taxonomy of context optimization

## Architecture

Memoria implements a hybrid memory architecture with six core components:

### 1. Core Memory (Working Memory)
- Immediate context window management
- Active conversation state
- Real-time context optimization

### 2. Episodic Memory
- Time-indexed interaction history
- Event sequences with temporal relationships
- Contextual snapshots

### 3. Semantic Memory
- Distilled knowledge and concepts
- Entity relationships
- Generalized patterns

### 4. Procedural Memory
- Learned workflows and strategies
- Task execution patterns
- Tool usage knowledge

### 5. Knowledge Vault
- Long-term persistent storage
- Archived information
- Reference materials

### 6. Relational Memory (Zettelkasten Network)
- Dynamic knowledge graph
- Bidirectional memory links
- Concept clustering

## Key Features

- **Agentic Memory Management**: Self-organizing memory with dynamic restructuring
- **Context Engineering**: Evolving playbooks with reflection and curation
- **Intelligent Decay**: Memory pruning based on recency, relevance, and utility
- **Multi-tier Retrieval**: Hybrid search with semantic, keyword, and graph-based retrieval
- **Memory Consolidation**: Automatic distillation of episodic to semantic memory
- **Contextual Awareness**: Adaptive context optimization for long-running agents

## Installation

```bash
pip install memoria-agent
```

## Quick Start

```python
from memoria import MemoryFramework

# Initialize the framework
memory = MemoryFramework(
    model="gpt-4",
    max_context_window=128000,
    enable_zettelkasten=True
)

# Add memories
memory.add_episodic("User prefers concise explanations", tags=["preference"])
memory.add_semantic("Python is a programming language", keywords=["python", "programming"])

# Query memory
relevant_memories = memory.retrieve(
    query="How should I explain Python?",
    k=5,
    retrieval_strategy="hybrid"
)

# Evolve context
memory.reflect_and_curate()
```

## Documentation

See `/docs` for detailed documentation on:
- Architecture and design principles
- API reference
- Advanced usage patterns
- Performance optimization
- Memory consolidation strategies

## License

MIT License

## Citation

If you use Memoria in your research, please cite the foundational papers:

```bibtex
@article{amem2025,
  title={A-MEM: Agentic Memory for LLM Agents},
  journal={arXiv preprint arXiv:2502.12110},
  year={2025}
}

@article{ace2025,
  title={Agentic Context Engineering: Evolving Contexts for Self-Improving Language Models},
  journal={arXiv preprint arXiv:2510.04618},
  year={2025}
}
```
