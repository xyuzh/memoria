"""
Memoria: Next-Generation Agent Memory Framework

A production-ready memory framework for LLM agents based on cutting-edge research.
"""

from memoria.core.framework import MemoryFramework
from memoria.core.memory_types import (
    Memory,
    EpisodicMemory,
    SemanticMemory,
    ProceduralMemory,
    MemoryType,
)
from memoria.core.config import MemoriaConfig

__version__ = "0.1.0"
__all__ = [
    "MemoryFramework",
    "Memory",
    "EpisodicMemory",
    "SemanticMemory",
    "ProceduralMemory",
    "MemoryType",
    "MemoriaConfig",
]
