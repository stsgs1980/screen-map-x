import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { OrthEdge as OrthEdgeType } from '../flow';

/**
 * Autoflow-style connector: orthogonal (SmoothStep) routing with
 * 8px corner radius, dash 3/4, #7C7C7C. Recomputed on every drag,
 * so lines follow their field ports. When its entity route is active
 * the line turns bright, starts marching and shows the entity chip;
 * everything else is dimmed (opacity driven from App via data flags).
 */
export function OrthEdge(props: EdgeProps<OrthEdgeType>) {
  const {
    id,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerEnd,
    data,
    selected,
  } = props;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
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
          stroke: hl || selected ? '#F2F2F2' : '#7C7C7C',
          strokeWidth: hl || selected ? 1.6 : 1,
          strokeDasharray: '3 4',
          opacity: dim ? 0.1 : 1,
          transition: 'opacity .18s ease, stroke .18s ease',
        }}
      />
      {hl && data && (
        <EdgeLabelRenderer>
          <div
            className="edge-chip"
            style={{ transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)` }}
          >
            {data.entity}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
