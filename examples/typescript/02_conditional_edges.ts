/**
 * Example 2: Conditional Branching (TypeScript)
 * ===============================================
 * Demonstrates conditional edges — the graph picks the next node
 * at runtime based on the current state.
 *
 * Concepts covered:
 *   - addConditionalEdges with a routing function
 *   - Branching to different nodes depending on state
 *   - Multiple paths converging on END
 *
 * Run: npx ts-node 02_conditional_edges.ts
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";

// ---------------------------------------------------------------------------
// 1. State schema.
// ---------------------------------------------------------------------------
const NumberState = Annotation.Root({
  value: Annotation<number>(),
  result: Annotation<string>(),
});

type NumberStateType = typeof NumberState.State;

// ---------------------------------------------------------------------------
// 2. Node functions.
// ---------------------------------------------------------------------------
function classify(_state: NumberStateType) {
  // Classification logic lives in the routing function.
  return {};
}

function handlePositive(state: NumberStateType) {
  return { result: `${state.value} is positive` };
}

function handleNegative(state: NumberStateType) {
  return { result: `${state.value} is negative` };
}

function handleZero(_state: NumberStateType) {
  return { result: "The value is zero" };
}

// ---------------------------------------------------------------------------
// 3. Routing function.
//    Returns the name of the next node to execute.
// ---------------------------------------------------------------------------
function routeBySign(state: NumberStateType): "positive" | "negative" | "zero" {
  if (state.value > 0) return "positive";
  if (state.value < 0) return "negative";
  return "zero";
}

// ---------------------------------------------------------------------------
// 4. Build the graph.
// ---------------------------------------------------------------------------
const builder = new StateGraph(NumberState)
  .addNode("classify", classify)
  .addNode("positive", handlePositive)
  .addNode("negative", handleNegative)
  .addNode("zero", handleZero)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", routeBySign)
  .addEdge("positive", END)
  .addEdge("negative", END)
  .addEdge("zero", END);

const graph = builder.compile();

// ---------------------------------------------------------------------------
// 5. Test with several values.
// ---------------------------------------------------------------------------
async function main() {
  for (const val of [42, -7, 0]) {
    const out = await graph.invoke({ value: val, result: "" });
    console.log(out.result);
  }
  // => 42 is positive
  // => -7 is negative
  // => The value is zero
}

main();
