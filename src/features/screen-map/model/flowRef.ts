import type { ReactFlowInstance } from "@xyflow/react";
import type { OrthEdge, ScreenFlowNode } from "../flow/adapter";

/** Non-reactive holder for the React Flow instance (fitView etc.). */
let instance: ReactFlowInstance<ScreenFlowNode, OrthEdge> | null = null;

/**
 * Register the instance on React Flow init.
 * @param next - instance from `onInit`
 */
export function setFlowInstance(next: ReactFlowInstance<ScreenFlowNode, OrthEdge>): void {
  instance = next;
}

/**
 * Current React Flow instance, if the canvas is mounted.
 * @returns instance or null
 */
export function getFlowInstance(): ReactFlowInstance<ScreenFlowNode, OrthEdge> | null {
  return instance;
}
