"""
Example 4: Persistence and Checkpointing
==========================================
Demonstrates how to attach a checkpointer so that graph state is
saved after every super-step, enabling resumption and conversation
memory across separate invocations.

Concepts covered:
  - MemorySaver (in-memory checkpointer)
  - Thread-based conversations via config["configurable"]["thread_id"]
  - Resuming a graph with prior state intact
  - Annotated reducer for message accumulation
"""

import operator
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver


# ---------------------------------------------------------------------------
# 1. State: a running conversation log.
# ---------------------------------------------------------------------------
class ChatState(TypedDict):
    # operator.add reducer appends new messages to the list
    messages: Annotated[list[str], operator.add]


# ---------------------------------------------------------------------------
# 2. A simple echo-bot node.
# ---------------------------------------------------------------------------
def echo_bot(state: ChatState) -> dict:
    last_message = state["messages"][-1]
    reply = f"Echo: {last_message}"
    return {"messages": [reply]}


# ---------------------------------------------------------------------------
# 3. Build graph with a checkpointer.
#    The MemorySaver stores state snapshots in a Python dict (in-process).
#    For production, swap with SqliteSaver or PostgresSaver.
# ---------------------------------------------------------------------------
builder = StateGraph(ChatState)
builder.add_node("bot", echo_bot)
builder.add_edge(START, "bot")
builder.add_edge("bot", END)

memory = MemorySaver()
graph = builder.compile(checkpointer=memory)

# ---------------------------------------------------------------------------
# 4. Run two separate invocations on the SAME thread.
#    The checkpointer automatically restores prior state for the thread,
#    so messages accumulate across calls.
# ---------------------------------------------------------------------------
config = {"configurable": {"thread_id": "thread-1"}}

# First turn
result1 = graph.invoke({"messages": ["Hi there!"]}, config)
print("After turn 1:", result1["messages"])
# => ['Hi there!', 'Echo: Hi there!']

# Second turn — prior messages are restored from the checkpoint
result2 = graph.invoke({"messages": ["How are you?"]}, config)
print("After turn 2:", result2["messages"])
# => ['Hi there!', 'Echo: Hi there!', 'How are you?', 'Echo: How are you?']

# ---------------------------------------------------------------------------
# 5. A different thread starts fresh.
# ---------------------------------------------------------------------------
config2 = {"configurable": {"thread_id": "thread-2"}}
result3 = graph.invoke({"messages": ["New conversation"]}, config2)
print("Thread 2:", result3["messages"])
# => ['New conversation', 'Echo: New conversation']
