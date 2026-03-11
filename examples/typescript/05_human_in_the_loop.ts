/**
 * Example 5: Human-in-the-Loop with Interrupts (TypeScript)
 * ===========================================================
 * Shows how to pause graph execution before a node, let a human
 * inspect or modify state, then resume.
 *
 * Concepts covered:
 *   - interruptBefore to pause at a specific node
 *   - Inspecting state with graph.getState()
 *   - Patching state with graph.updateState()
 *   - Resuming execution by invoking with null input
 *
 * Run: npx ts-node 05_human_in_the_loop.ts
 */

import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";

// ---------------------------------------------------------------------------
// 1. State schema.
// ---------------------------------------------------------------------------
const ApprovalState = Annotation.Root({
  task: Annotation<string>(),
  approved: Annotation<boolean>(),
  log: Annotation<string[]>({
    reducer: (existing, update) => [...existing, ...update],
    default: () => [],
  }),
});

type ApprovalStateType = typeof ApprovalState.State;

// ---------------------------------------------------------------------------
// 2. Nodes.
// ---------------------------------------------------------------------------
function propose(state: ApprovalStateType) {
  return { log: [`Proposed task: ${state.task}`] };
}

function execute(state: ApprovalStateType) {
  if (state.approved) {
    return { log: [`Executing: ${state.task}`] };
  }
  return { log: ["Task was rejected by human reviewer."] };
}

// ---------------------------------------------------------------------------
// 3. Build graph with an interrupt before "execute".
//    The graph pauses after 'propose' and before 'execute',
//    giving a human the chance to review and approve.
// ---------------------------------------------------------------------------
const builder = new StateGraph(ApprovalState)
  .addNode("propose", propose)
  .addNode("execute", execute)
  .addEdge(START, "propose")
  .addEdge("propose", "execute")
  .addEdge("execute", END);

const memory = new MemorySaver();
const graph = builder.compile({
  checkpointer: memory,
  interruptBefore: ["execute"], // <-- pause here
});

// ---------------------------------------------------------------------------
// 4. Run the graph — it pauses before "execute".
// ---------------------------------------------------------------------------
async function main() {
  const config = { configurable: { thread_id: "approval-1" } };

  const result = await graph.invoke(
    { task: "Deploy to production", approved: false, log: [] },
    config
  );

  console.log("Paused state log:", result.log);
  // => ['Proposed task: Deploy to production']

  // -------------------------------------------------------------------------
  // 5. Human reviews and approves — patch state via updateState.
  // -------------------------------------------------------------------------
  await graph.updateState(config, { approved: true });

  // -------------------------------------------------------------------------
  // 6. Resume execution by invoking with null input.
  // -------------------------------------------------------------------------
  const final = await graph.invoke(null, config);
  console.log("Final log:", final.log);
  // => ['Proposed task: Deploy to production', 'Executing: Deploy to production']
}

main();
