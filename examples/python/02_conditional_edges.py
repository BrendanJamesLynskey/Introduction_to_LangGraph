"""
Example 2: Conditional Branching
=================================
Demonstrates conditional edges — the graph decides which node to
visit next based on the current state.

Concepts covered:
  - add_conditional_edges with a routing function
  - Branching to different nodes based on state values
  - Multiple terminal paths converging on END
"""

from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END


# ---------------------------------------------------------------------------
# 1. State schema: a number and its classification result.
# ---------------------------------------------------------------------------
class NumberState(TypedDict):
    value: int
    result: str


# ---------------------------------------------------------------------------
# 2. Node functions.
# ---------------------------------------------------------------------------
def classify(state: NumberState) -> dict:
    """Placeholder node — classification happens in the routing function."""
    return {}


def handle_positive(state: NumberState) -> dict:
    return {"result": f"{state['value']} is positive"}


def handle_negative(state: NumberState) -> dict:
    return {"result": f"{state['value']} is negative"}


def handle_zero(state: NumberState) -> dict:
    return {"result": "The value is zero"}


# ---------------------------------------------------------------------------
# 3. Routing function.
#    Returns the *name* of the next node. LangGraph uses this to pick
#    which edge to follow after the "classify" node completes.
# ---------------------------------------------------------------------------
def route_by_sign(state: NumberState) -> Literal["positive", "negative", "zero"]:
    if state["value"] > 0:
        return "positive"
    elif state["value"] < 0:
        return "negative"
    else:
        return "zero"


# ---------------------------------------------------------------------------
# 4. Build and wire the graph.
# ---------------------------------------------------------------------------
builder = StateGraph(NumberState)

builder.add_node("classify", classify)
builder.add_node("positive", handle_positive)
builder.add_node("negative", handle_negative)
builder.add_node("zero", handle_zero)

builder.add_edge(START, "classify")

# After "classify", call route_by_sign to decide the next node.
builder.add_conditional_edges("classify", route_by_sign)

# All three branches lead to END.
builder.add_edge("positive", END)
builder.add_edge("negative", END)
builder.add_edge("zero", END)

graph = builder.compile()

# ---------------------------------------------------------------------------
# 5. Try several inputs.
# ---------------------------------------------------------------------------
for val in [42, -7, 0]:
    out = graph.invoke({"value": val, "result": ""})
    print(out["result"])
# => 42 is positive
# => -7 is negative
# => The value is zero
