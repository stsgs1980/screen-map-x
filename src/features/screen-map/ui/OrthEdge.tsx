import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import type { ReactElement } from "react";
import { EDGE_STYLE } from "../data/constants";
import type { OrthEdge as OrthEdgeType } from "../flow/adapter";

/**
 * Autoflow-style connector: orthogonal (SmoothStep) routing with the
 * corner radius, dash and colour locked in EDGE_STYLE. Recomputed on every
 * drag, so lines follow their field ports. When its entity route is active
 * the line turns bright, starts marching and shows the entity chip;
 * everything else is dimmed (opacity driven from App via data flags).
 * @param props - React Flow edge props
 * @returns the routed path plus an entity chip while highlighted
 */
export function OrthEdge(props: EdgeProps<OrthEdgeType>): ReactElement {
  const { id, sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, markerEnd, data, selected } = props;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: EDGE_STYLE.cornerRadius,
    offset: data?.offset ?? 20,
  });

  const hl = !!data?.highlight;
  const dim = !!data?.dimmed;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        interactionWidth={16}
        style={{
          stroke: hl || selected ? "var(--edge-hl)" : EDGE_STYLE.color,
          strokeWidth: hl || selected ? 1.6 : 1,
          strokeDasharray: EDGE_STYLE.dash,
          opacity: dim ? 0.1 : 1,
          transition: "opacity .18s ease, stroke .18s ease",
        }}
      />
      {hl && data && (
        <EdgeLabelRenderer>
          <div className="edge-chip" style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}>
            {data.entity}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
