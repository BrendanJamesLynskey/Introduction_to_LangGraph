/**
 * Example 1: Simple Sequential Graph (TypeScript)
 * =================================================
 * The most basic LangGraph.js example — a linear graph with two
 * nodes that process shared state sequentially.
 *
 * Concepts covered:
 *   - Defining a state interface with Annotation.Root
 *   - Creating node functions that return partial state updates
 *   - Building a graph with addNode / addEdge
 *   - Compiling and invoking the graph
 *
 * Run: npx ts-node 01_simple_graph.ts
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";

// ---------------------------------------------------------------------------
// 1. Define the shared state schema using Annotation.Root.
//    Each field gets a default value. Reducers are optional — without one,
//    updates overwrite the previous value (last-writer-wins).
// ---------------------------------------------------------------------------
const GreetingState = Annotation.Root({
  name: Annotation<string>(),
  greeting: Annotation<string>(),
});

// Infer the TypeScript type from the annotation for use in node signatures.
type GreetingStateType = typeof GreetingState.State;

// ---------------------------------------------------------------------------
// 2. Node functions.
//    Each receives the current state and returns a partial update object.
// ---------------------------------------------------------------------------
function greet(state: GreetingStateType) {
  return { greeting: `Hello, ${state.name}!` };
}

function shout(state: GreetingStateType) {
  return { greeting: state.greeting.toUpperCase() };
}

// ---------------------------------------------------------------------------
// 3. Build the graph.
// ---------------------------------------------------------------------------
const builder = new StateGraph(GreetingState)
  .addNode("greet", greet)
  .addNode("shout", shout)
  .addEdge(START, "greet")
  .addEdge("greet", "shout")
  .addEdge("shout", END);

const graph = builder.compile();

// ---------------------------------------------------------------------------
// 4. Invoke the graph.
// ---------------------------------------------------------------------------
async function main() {
  const result = await graph.invoke({ name: "World", greeting: "" });
  console.log(result);
  // => { name: 'World', greeting: 'HELLO, WORLD!' }
}

main();
