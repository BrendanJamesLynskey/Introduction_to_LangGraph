# LangGraph — Stateful Agent Orchestration

Interactive slide deck covering LangGraph's graph-based execution model, state management, persistence, and multi-agent patterns.

## ▶ [Open Presentation](https://brendanjameslynskey.github.io/Introduction_to_LangGraph/)

---

## Contents

| Slide | Topic |
| --- | --- |
| 01 | Motivation — Beyond Linear Chains |
| 02 | Architecture Overview |
| 03 | State — The Shared Memory Model |
| 04 | Nodes — Units of Computation |
| 05 | Edges & the Pregel Execution Model |
| 06 | Graph Compilation |
| 07 | Persistence & Checkpointing |
| 08 | Human-in-the-Loop |
| 09 | Multi-Agent Patterns |
| 10 | Streaming |
| 11 | Deployment — LangGraph Platform |
| 12 | Framework Comparison |
| 13 | Strengths & Trade-Offs |
| 14 | Worked Example — ReAct Research Agent |
| 15 | Summary & References |

---

## Coverage

**Motivation** — Why linear chain-based LLM orchestration breaks down for real agent workflows requiring cycles, shared state, and human feedback. LangGraph's positioning as a low-level stateful orchestration primitive.

**Core Primitives** — The three-component model: `State` (typed shared dictionary, reducer functions, partial updates), `Nodes` (plain callables, async, LangChain Runnables, subgraph nodes), and `Edges` (direct, conditional, fan-out via `Send`).

**Pregel Execution** — Super-step semantics inspired by Google's Pregel BSP model. Nodes active in the same super-step execute in parallel; sequential nodes belong to separate super-steps. ReAct cycle topology with conditional routing to `END`.

**Graph Compilation** — Structural validation (orphan detection, reachability, schema checks), runtime configuration attachment (checkpointer, interrupt points), and the resulting `CompiledGraph` Runnable interface: `invoke`, `stream`, `astream_events`.

**Persistence** — Checkpointer backends (InMemorySaver, SqliteSaver, PostgresSaver, CosmosDBSaver) with a common `BaseCheckpointSaver` interface. Capabilities enabled: fault-tolerant resumption, time-travel debugging, cross-thread long-term memory via `Store`, and human-in-the-loop as a first-class feature.

**Human-in-the-Loop** — Compile-time breakpoints (`interrupt_before` / `interrupt_after`), dynamic `interrupt()` calls within nodes, `Command(resume=…)` for continuation, and `update_state()` for human state patching mid-run.

**Multi-Agent Patterns** — Supervisor/orchestrator topology, peer/swarm handoffs via `Command(goto=…)`, and scatter-gather fan-out with `Send`. Subgraph composition rules and automatic checkpointer propagation from root to all subgraphs.

**Streaming** — Five stream modes (`values`, `updates`, `debug`, `messages`, `custom`), `astream_events` for token-level LLM streaming with zero orchestration overhead. Subgraph event exposure via `subgraphs=True`.

**Deployment** — LangGraph Platform (managed), LangGraph Server (self-hosted Docker via `langgraph-cli`), LangGraph Studio GUI debugger, and runtime `Configuration` schema for per-request parameter injection.

**Framework Comparison** — LangGraph vs CrewAI, AutoGen/AG2, and OpenAI Agents SDK across execution model, state management, cycle support, persistence, human-in-the-loop, multi-agent topology, streaming, and observability.

**Worked Example** — Complete ReAct research agent (~40 lines): typed state with `add_messages` reducer, conditional edge routing, cyclic `agent → tools → agent` topology, `InMemorySaver` checkpointer, and `interrupt_before=["tools"]` for human approval.

---

## Slide Controls

| Action | Key |
| --- | --- |
| Next / Previous | `→` `←` or swipe |
| Overview | `Esc` |
| Fullscreen | `F` |
| Export to PDF | append `?print-pdf` to URL |

---

## Technology

[Reveal.js 4.6](https://revealjs.com) · [highlight.js](https://highlightjs.org) (Monokai) · Playfair Display + DM Sans + JetBrains Mono

## References

LangGraph Documentation — *docs.langchain.com* · LangGraph GitHub — *github.com/langchain-ai/langgraph* · Malewicz et al., "Pregel: A System for Large-Scale Graph Processing," SIGMOD 2010 · LangChain Academy — *academy.langchain.com* · LangGraph Platform — *langchain.com/langgraph*

## License

Educational use. Code examples provided as-is.
