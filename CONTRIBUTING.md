# Contributing to Memoria

Thank you for your interest in contributing to Memoria! This document provides guidelines and instructions for contributing.

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/memoria/memoria-agent.git
cd memoria-agent
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Development Dependencies

```bash
pip install -e ".[dev]"
```

This installs:
- Core dependencies
- Testing tools (pytest)
- Code formatting (black, ruff)
- Type checking (mypy)

### 4. Run Tests

```bash
pytest tests/ -v
```

### 5. Code Formatting

```bash
# Format code
black memoria/ tests/ examples/

# Lint
ruff check memoria/ tests/ examples/

# Type check
mypy memoria/
```

## Project Structure

```
memoria/
├── memoria/           # Main package
│   ├── core/         # Core framework components
│   ├── retrieval/    # Retrieval strategies
│   ├── consolidation/# Memory consolidation
│   └── utils/        # Utility functions
├── tests/            # Test suite
├── examples/         # Usage examples
└── docs/             # Documentation
```

## Contribution Guidelines

### Code Style

- **Python Version**: 3.10+
- **Line Length**: 100 characters
- **Formatting**: Use `black` for consistent formatting
- **Linting**: Pass `ruff` checks
- **Type Hints**: Add type hints to all functions
- **Docstrings**: Google-style docstrings

Example:

```python
def retrieve_memories(
    query: str,
    k: int = 5,
    strategy: str = "hybrid"
) -> List[Memory]:
    """
    Retrieve relevant memories using specified strategy.

    Args:
        query: Search query string
        k: Number of memories to retrieve
        strategy: Retrieval strategy (semantic, keyword, hybrid, graph)

    Returns:
        List of Memory objects ranked by relevance

    Raises:
        ValueError: If strategy is unknown
    """
    # Implementation
    pass
```

### Testing

- Write tests for all new features
- Maintain or improve test coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

Example:

```python
def test_memory_retrieval_with_hybrid_strategy():
    """Test that hybrid retrieval combines semantic and keyword results."""
    # Arrange
    memory = MemoryFramework(retrieval_strategy="hybrid")
    memory.add_episodic("Python programming", keywords=["python"])

    # Act
    results = memory.retrieve("python", k=5)

    # Assert
    assert len(results) > 0
    assert results[0].content == "Python programming"
```

### Documentation

- Update docs for API changes
- Add examples for new features
- Keep README up to date
- Use clear, concise language

### Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `chore`: Maintenance

**Example:**

```
feat(retrieval): add graph-based retrieval strategy

Implements Zettelkasten network traversal for knowledge discovery.
Uses BFS to explore connected memories up to configurable depth.

Closes #123
```

## Areas for Contribution

### High Priority

1. **Multimodal Memory**
   - Add support for image embeddings
   - Implement audio/video memory types
   - Create multimodal retrieval

2. **Storage Backends**
   - SQLite implementation
   - PostgreSQL adapter
   - Redis caching layer

3. **Performance Optimization**
   - Async operations
   - Parallel embedding generation
   - Query optimization

4. **Integration Plugins**
   - LangChain integration
   - LlamaIndex compatibility
   - AutoGen connector

### Medium Priority

5. **Advanced Retrieval**
   - Semantic re-ranking
   - Query expansion
   - Fuzzy matching

6. **Analytics & Monitoring**
   - Memory usage dashboard
   - Performance metrics
   - Query analytics

7. **Privacy & Security**
   - Encryption at rest
   - Access control lists
   - Audit logging

### Low Priority

8. **Developer Experience**
   - CLI tool
   - Web UI for visualization
   - Jupyter notebook integration

9. **Advanced Features**
   - Collaborative memory
   - Distributed storage
   - Real-time sync

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feat/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation
- Run formatting/linting

### 3. Commit Changes

```bash
git add .
git commit -m "feat(scope): description"
```

### 4. Push Branch

```bash
git push origin feat/your-feature-name
```

### 5. Create Pull Request

- Use descriptive title
- Fill out PR template
- Link related issues
- Request review

### 6. Address Feedback

- Respond to comments
- Make requested changes
- Update PR

### 7. Merge

Once approved, your PR will be merged!

## PR Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Type hints added
- [ ] Docstrings written
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow convention

## Testing Guidelines

### Unit Tests

Test individual components in isolation:

```python
def test_memory_decay_mechanism():
    """Test that memory importance decreases over time."""
    memory = Memory(content="Test", importance_score=0.8)
    memory.apply_decay(time_delta_hours=24)
    assert memory.importance_score < 0.8
```

### Integration Tests

Test component interactions:

```python
def test_consolidation_creates_semantic_from_episodic():
    """Test full consolidation flow."""
    framework = MemoryFramework(consolidation_threshold=3)

    # Add related episodic memories
    for i in range(5):
        framework.add_episodic(f"Python fact {i}", keywords=["python"])

    # Trigger consolidation
    semantic = framework.consolidate_memories()

    # Verify semantic memory created
    assert len(semantic) > 0
    assert semantic[0].memory_type == MemoryType.SEMANTIC
```

### Test Coverage Goals

- Core functionality: 90%+
- Retrieval: 80%+
- Consolidation: 80%+
- Context engineering: 70%+

Run coverage:

```bash
pytest --cov=memoria tests/
```

## Documentation Guidelines

### API Documentation

Use Google-style docstrings:

```python
def method_name(param1: str, param2: int = 5) -> bool:
    """
    One-line summary.

    Longer description if needed. Explain the purpose,
    behavior, and any important details.

    Args:
        param1: Description of param1
        param2: Description of param2 (default: 5)

    Returns:
        Description of return value

    Raises:
        ValueError: When param1 is empty
        TypeError: When param2 is not an integer

    Example:
        >>> result = method_name("test", 10)
        >>> print(result)
        True
    """
    pass
```

### Markdown Documentation

- Use headings hierarchically (H1 → H2 → H3)
- Include code examples
- Add diagrams where helpful
- Keep paragraphs concise
- Use lists for clarity

## Code Review Process

### What Reviewers Look For

1. **Correctness**: Does it work as intended?
2. **Tests**: Are there adequate tests?
3. **Style**: Does it follow guidelines?
4. **Documentation**: Is it well documented?
5. **Performance**: Any performance concerns?
6. **Security**: Any security issues?
7. **Maintainability**: Is it easy to understand?

### Review Etiquette

**For Authors:**
- Be responsive to feedback
- Don't take criticism personally
- Explain your reasoning
- Be willing to iterate

**For Reviewers:**
- Be respectful and constructive
- Explain the "why" behind suggestions
- Acknowledge good work
- Focus on the code, not the person

## Questions or Issues?

- **Bug Reports**: Use GitHub Issues with bug template
- **Feature Requests**: Use GitHub Issues with feature template
- **Questions**: Start a GitHub Discussion
- **Security Issues**: Email security@memoria.ai (if applicable)

## Resources

- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Research Summary](docs/RESEARCH_SUMMARY.md)
- [Examples](examples/)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Memoria! Your efforts help make AI agent memory better for everyone.
