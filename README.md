# memoria

## Inspired by
<https://chatgpt.com/share/689a9c79-c7e0-8004-a2e2-74d0d89a79f2>

## Chars

```mermaid
flowchart TB
  U([User Input])
  O{{Memory Orchestrator}}

  subgraph Stores
    direction TB
    STM[(STM<br/>Dialog Pages)]
    MTM[(MTM<br/>Summarized Segments + Heat)]
    LPM[(LPM<br/>Long-Term Persona)]
    SHIMI[[SHIMI<br/>Semantic Tree]]
    KG[(Graphiti Temporal KG<br/>&#40;Facts + Episodes&#41;<br/>Episodes ↔ Entities)]
  end

  U --> O
  O -->|retrieve| STM
  O -->|retrieve| MTM
  O -->|retrieve| LPM
  O -->|retrieve concepts| SHIMI
  O -->|query facts + episodes| KG

  C[[Assemble Prompt Context]]
  STM --> C
  MTM --> C
  LPM --> C
  SHIMI --> C
  KG --> C

  C --> LLM[[LLM]]
  LLM --> R([Agent Response])
  R --> O

  O -->|addDialog| STM
  O -->|segment + update heat| MTM
  O -->|promote if hot| LPM
  O -->|insert concepts| SHIMI
  O -->|upsert facts + add episode| KG
```

## Team Members

- Huan <https://github.com/huan> Yay~
- Xinyu <https://www.linkedin.com/in/zhxy/> 
- Jai <https://www.linkedin.com/in/jai-d>

![Selfie](images/selfie.png)
