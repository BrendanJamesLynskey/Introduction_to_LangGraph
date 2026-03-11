/**
 * Example 4: Persistence and Checkpointing (TypeScript)
 * =======================================================
 * Demonstrates how to attach a checkpointer so graph state survives
 * across invocations, enabling multi-turn conversations.
 *
 * Concepts covered:
 *   - MemorySaver checkpointer
 *   - Thread-based sessions via configurable.thread_id
 *   - Resuming a graph with prior state intact
 *   - Reducer for message accumulation
 *
 * Run: npx ts-node 04_persistence_checkpointing.ts
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";

// ---------------------------------------------------------------------------
// 1. State: a running conversation log with an append reducer.
// ---------------------------------------------------------------------------
const ChatState = Annotation.Root({
  messages: Annotation<string[]>({
    reducer: (existing, update) => [...existing, ...update],
    default: () => [],
  }),
});

type ChatStateType = typeof ChatState.State;

// ---------------------------------------------------------------------------
// 2. A simple echo-bot node.
// ---------------------------------------------------------------------------
function echoBot(state: ChatStateType) {
  const lastMessage = state.messages[state.messages.length - 1];
  return { messages: [`Echo: ${lastMessage}`] };
}

// ---------------------------------------------------------------------------
// 3. Build graph with a MemorySaver checkpointer.
//    For production, use SqliteSaver or PostgresSaver instead.
// ---------------------------------------------------------------------------
const builder = new StateGraph(ChatState)
  .addNode("bot", echoBot)
  .addEdge(START, "bot")
  .addEdge("bot", END);

const memory = new MemorySaver();
const graph = builder.compile({ checkpointer: memory });

// ---------------------------------------------------------------------------
// 4. Two invocations on the same thread — state accumulates.
// ---------------------------------------------------------------------------
async function main() {
  const config = { configurable: { thread_id: "thread-1" } };

  // First turn
  const result1 = await graph.invoke({ messages: ["Hi there!"] }, config);
  console.log("After turn 1:", result1.messages);
  // => ['Hi there!', 'Echo: Hi there!']

  // Second turn — prior messages restored from checkpoint
  const result2 = await graph.invoke({ messages: ["How are you?"] }, config);
  console.log("After turn 2:", result2.messages);
  // => ['Hi there!', 'Echo: Hi there!', 'How are you?', 'Echo: How are you?']

  // A different thread starts fresh
  const config2 = { configurable: { thread_id: "thread-2" } };
  const result3 = await graph.invoke(
    { messages: ["New conversation"] },
    config2
  );
  console.log("Thread 2:", result3.messages);
  // => ['New conversation', 'Echo: New conversation']
}

main();
