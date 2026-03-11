# LangGraph — Stateful Agent Orchestration

Interactive slide deck and hands-on code examples covering LangGraph's graph-based execution model, state management, persistence, and multi-agent patterns.

## ▶ [Open Presentation](https://brendanjameslynskey.github.io/Introduction_to_LangGraph/)

---

## Code Examples

Ten runnable examples (5 Python, 5 TypeScript) that progressively introduce LangGraph's core concepts. Each example is self-contained, well-commented, and requires no LLM API key.

### Python (`examples/python/`)

| # | File | Concept |
|---|------|---------|
| 1 | [`01_simple_graph.py`](examples/python/01_simple_graph.py) | Sequential graph — state schema, nodes, edges, compile & invoke |
| 2 | [`02_conditional_edges.py`](examples/python/02_conditional_edges.py) | Conditional branching — routing function picks the next node at runtime |
| 3 | [`03_reducer_and_cycles.py`](examples/python/03_reducer_and_cycles.py) | Reducers & cycles — `Annotated` with `operator.add`, looping graphs |
| 4 | [`04_persistence_checkpointing.py`](examples/python/04_persistence_checkpointing.py) | Checkpointing — `MemorySaver`, thread-based multi-turn conversations |
| 5 | [`05_human_in_the_loop.py`](examples/python/05_human_in_the_loop.py) | Human-in-the-loop — `interrupt_before`, `update_state`, resume |

### TypeScript (`examples/typescript/`)

| # | File | Concept |
|---|------|---------|
| 1 | [`01_simple_graph.ts`](examples/typescript/01_simple_graph.ts) | Sequential graph — `Annotation.Root`, nodes, edges, compile & invoke |
| 2 | [`02_conditional_edges.ts`](examples/typescript/02_conditional_edges.ts) | Conditional branching — `addConditionalEdges` with a routing function |
| 3 | [`03_reducer_and_cycles.ts`](examples/typescript/03_reducer_and_cycles.ts) | Reducers & cycles — custom reducer function, looping graphs |
| 4 | [`04_persistence_checkpointing.ts`](examples/typescript/04_persistence_checkpointing.ts) | Checkpointing — `MemorySaver`, thread-based multi-turn conversations |
| 5 | [`05_human_in_the_loop.ts`](examples/typescript/05_human_in_the_loop.ts) | Human-in-the-loop — `interruptBefore`, `updateState`, resume |

### Running the Examples

**Python:**

```bash
pip install langgraph
cd examples/python
python 01_simple_graph.py
```

**TypeScript:**

```bash
npm install @langchain/langgraph
cd examples/typescript
npx ts-node 01_simple_graph.ts
```

---

## Slide Deck Contents

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
