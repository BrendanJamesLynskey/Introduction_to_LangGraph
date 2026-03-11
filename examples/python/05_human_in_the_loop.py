"""
Example 5: Human-in-the-Loop with Interrupts
==============================================
Shows how to pause graph execution before a node runs, let a human
inspect/modify state, then resume execution.

Concepts covered:
  - interrupt_before to pause execution at a specific node
  - Inspecting graph state with graph.get_state()
  - Resuming execution with a None input (continue from checkpoint)
  - Using Command(resume=...) for dynamic human input
"""

import operator
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver


# ---------------------------------------------------------------------------
# 1. State schema.
# ---------------------------------------------------------------------------
class ApprovalState(TypedDict):
    task: str
    approved: bool
    log: Annotated[list[str], operator.add]


# ---------------------------------------------------------------------------
# 2. Nodes.
# ---------------------------------------------------------------------------
def propose(state: ApprovalState) -> dict:
    """Generate a proposal that requires human approval."""
    return {"log": [f"Proposed task: {state['task']}"]}


def execute(state: ApprovalState) -> dict:
    """Execute the task — only runs after human approval."""
    if state["approved"]:
        return {"log": [f"Executing: {state['task']}"]}
    else:
        return {"log": ["Task was rejected by human reviewer."]}


# ---------------------------------------------------------------------------
# 3. Build graph with an interrupt *before* the execute node.
#    The graph will pause after 'propose' completes and before
#    'execute' starts, giving a human a chance to review.
# ---------------------------------------------------------------------------
builder = StateGraph(ApprovalState)
builder.add_node("propose", propose)
builder.add_node("execute", execute)

builder.add_edge(START, "propose")
builder.add_edge("propose", "execute")
builder.add_edge("execute", END)

memory = MemorySaver()

# interrupt_before=["execute"] tells the graph to pause before running
# the "execute" node, yielding control back to the caller.
graph = builder.compile(checkpointer=memory, interrupt_before=["execute"])

# ---------------------------------------------------------------------------
# 4. First invocation — graph pauses before "execute".
# ---------------------------------------------------------------------------
config = {"configurable": {"thread_id": "approval-1"}}

result = graph.invoke(
    {"task": "Deploy to production", "approved": False, "log": []},
    config,
)

print("Paused state log:", result["log"])
# => ['Proposed task: Deploy to production']

# ---------------------------------------------------------------------------
# 5. Human reviews and patches state to approve the task.
#    update_state() writes directly into the checkpoint so the next
#    resumption sees the updated values.
# ---------------------------------------------------------------------------
graph.update_state(config, {"approved": True})

# ---------------------------------------------------------------------------
# 6. Resume execution — pass None as input to continue from checkpoint.
# ---------------------------------------------------------------------------
final = graph.invoke(None, config)

print("Final log:", final["log"])
# => ['Proposed task: Deploy to production', 'Executing: Deploy to production']
