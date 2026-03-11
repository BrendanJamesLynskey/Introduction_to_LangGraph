"""
Example 3: Reducers and Cyclic Graphs
=======================================
Shows how to use an Annotated reducer to *accumulate* state across
iterations, and how to create a cycle (loop) in the graph.

Concepts covered:
  - Annotated fields with operator.add as a reducer
  - Cyclic graphs (node loops back to itself via conditional edge)
  - Counting iterations with shared state
"""

import operator
from typing import Annotated, TypedDict, Literal
from langgraph.graph import StateGraph, START, END


# ---------------------------------------------------------------------------
# 1. State with a reducer.
#    The `messages` field uses operator.add, so every partial update
#    *appends* to the existing list instead of replacing it.
#    `counter` is a plain int — updates overwrite the previous value.
# ---------------------------------------------------------------------------
class LoopState(TypedDict):
    counter: int
    messages: Annotated[list[str], operator.add]  # reducer: list concatenation


# ---------------------------------------------------------------------------
# 2. A node that increments the counter and logs a message.
# ---------------------------------------------------------------------------
def step(state: LoopState) -> dict:
    new_count = state["counter"] + 1
    return {
        "counter": new_count,
        # Because of the reducer, this list is *appended* to state["messages"]
        "messages": [f"Step {new_count} executed"],
    }


# ---------------------------------------------------------------------------
# 3. Routing function — loop until counter reaches 3, then exit.
# ---------------------------------------------------------------------------
def should_continue(state: LoopState) -> Literal["step", "__end__"]:
    if state["counter"] < 3:
        return "step"   # Loop back to the same node
    return "__end__"    # Equivalent to END


# ---------------------------------------------------------------------------
# 4. Build a cyclic graph: START → step →(loop or END).
# ---------------------------------------------------------------------------
builder = StateGraph(LoopState)

builder.add_node("step", step)

builder.add_edge(START, "step")
builder.add_conditional_edges("step", should_continue)

graph = builder.compile()

result = graph.invoke({"counter": 0, "messages": []})

print(f"Final counter: {result['counter']}")
print("Messages accumulated via reducer:")
for msg in result["messages"]:
    print(f"  - {msg}")
# => Final counter: 3
# => Messages accumulated via reducer:
# =>   - Step 1 executed
# =>   - Step 2 executed
# =>   - Step 3 executed
