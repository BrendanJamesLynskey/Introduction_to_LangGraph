"""
Example 1: Simple Sequential Graph
===================================
The most basic LangGraph example — a linear graph with two nodes
that process a shared state dictionary sequentially.

Concepts covered:
  - Defining a TypedDict state schema
  - Creating node functions that read/write state
  - Building a graph with add_node / add_edge
  - Compiling and invoking the graph
"""

from typing import TypedDict
from langgraph.graph import StateGraph, START, END


# ---------------------------------------------------------------------------
# 1. Define the shared state schema.
#    Every node receives and returns a dict matching this shape.
# ---------------------------------------------------------------------------
class GreetingState(TypedDict):
    name: str       # Input: the person's name
    greeting: str   # Output: the constructed greeting


# ---------------------------------------------------------------------------
# 2. Define node functions.
#    Each node takes the current state and returns a partial update dict.
#    LangGraph merges the returned dict into the existing state automatically.
# ---------------------------------------------------------------------------
def greet(state: GreetingState) -> dict:
    """Build a greeting string from the name in state."""
    return {"greeting": f"Hello, {state['name']}!"}


def shout(state: GreetingState) -> dict:
    """Convert the greeting to uppercase for emphasis."""
    return {"greeting": state["greeting"].upper()}


# ---------------------------------------------------------------------------
# 3. Build the graph.
#    - Register each function as a named node.
#    - Wire them together with edges (START → greet → shout → END).
# ---------------------------------------------------------------------------
graph_builder = StateGraph(GreetingState)

graph_builder.add_node("greet", greet)
graph_builder.add_node("shout", shout)

graph_builder.add_edge(START, "greet")   # Entry point
graph_builder.add_edge("greet", "shout") # greet feeds into shout
graph_builder.add_edge("shout", END)     # shout is the final step

# ---------------------------------------------------------------------------
# 4. Compile and run.
#    compile() validates the graph structure (reachability, schema, etc.)
#    and returns a CompiledGraph that behaves like a LangChain Runnable.
# ---------------------------------------------------------------------------
graph = graph_builder.compile()

result = graph.invoke({"name": "World", "greeting": ""})
print(result)
# => {'name': 'World', 'greeting': 'HELLO, WORLD!'}
