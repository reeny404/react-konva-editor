import type { CanvasNode, NodeId } from '@/types/node';

/** parentId가 같은 자식 노드만 반환 */
const getChildrenByParentId = (
  nodes: CanvasNode[],
  parentId: NodeId,
): CanvasNode[] => {
  return nodes.filter((n): n is CanvasNode & { parentId?: NodeId } => {
    return (n as CanvasNode & { parentId?: NodeId }).parentId === parentId;
  });
};

/** parentId를 루트로 하는 모든 하위 노드 반환 */
export const getAllDescendants = (
  nodes: CanvasNode[],
  parentId: NodeId,
): CanvasNode[] => {
  const children = getChildrenByParentId(nodes, parentId);
  return children.reduce<CanvasNode[]>((acc, child) => {
    return [...acc, child, ...getAllDescendants(nodes, child.id)];
  }, []);
};
