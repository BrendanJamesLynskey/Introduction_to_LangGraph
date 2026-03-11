/**
 * Example 3: Reducers and Cyclic Graphs (TypeScript)
 * ====================================================
 * Shows how to use a reducer to accumulate state across loop
 * iterations, and how to create a cycle in the graph.
 *
 * Concepts covered:
 *   - Annotation with a custom reducer function
 *   - Cyclic graphs (a node that loops back to itself)
 *   - Counting iterations via shared state
 *
 * Run: npx ts-node 03_reducer_and_cycles.ts
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";

// ---------------------------------------------------------------------------
// 1. State with a reducer on the `messages` field.
//    The reducer function receives (existing, update) and returns the
//    merged result. Here we concatenate arrays.
// ---------------------------------------------------------------------------
const LoopState = Annotation.Root({
  counter: Annotation<number>(),
  messages: Annotation<string[]>({
    // Reducer: append new messages to the existing list
    reducer: (existing, update) => [...existing, ...update],
    default: () => [],
  }),
});

type LoopStateType = typeof LoopState.State;

// ---------------------------------------------------------------------------
// 2. A node that increments the counter and logs a message.
// ---------------------------------------------------------------------------
function step(state: LoopStateType) {
  const newCount = state.counter + 1;
  return {
    counter: newCount,
    // Thanks to the reducer, this array is appended — not replaced.
    messages: [`Step ${newCount} executed`],
  };
}

// ---------------------------------------------------------------------------
// 3. Routing function — loop until counter reaches 3.
// ---------------------------------------------------------------------------
function shouldContinue(state: LoopStateType): "step" | "__end__" {
  return state.counter < 3 ? "step" : "__end__";
}

// ---------------------------------------------------------------------------
// 4. Build a cyclic graph: START → step →(loop or END).
// ---------------------------------------------------------------------------
const builder = new StateGraph(LoopState)
  .addNode("step", step)
  .addEdge(START, "step")
  .addConditionalEdges("step", shouldContinue);

const graph = builder.compile();

// ---------------------------------------------------------------------------
// 5. Run it.
// ---------------------------------------------------------------------------
async function main() {
  const result = await graph.invoke({ counter: 0, messages: [] });

  console.log(`Final counter: ${result.counter}`);
  console.log("Messages accumulated via reducer:");
  for (const msg of result.messages) {
    console.log(`  - ${msg}`);
  }
  // => Final counter: 3
  // => Messages accumulated via reducer:
  // =>   - Step 1 executed
  // =>   - Step 2 executed
  // =>   - Step 3 executed
}

main();
