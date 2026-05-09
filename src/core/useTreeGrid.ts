import { useState, useRef, useEffect, useMemo } from 'react';
import { flattenTreeData } from './treeEngine';
import type { RawTreeNode, InternalTreeNode } from './treeEngine';

export function useTreeGrid(rawData: RawTreeNode[], defaultExpandAll = false) {
  // 我们需要一个 ref 来长期保存全量的引擎数据，避免不必要的重新计算
  const engineRef = useRef<{
    flatList: InternalTreeNode[];
    nodeMap: Record<string | number, InternalTreeNode>;
  }>({ flatList: [], nodeMap: {} });

  // 触发视图更新的 state：每次引擎数据有变动时，我们通过更新这个 trigger 来重新渲染
  const [renderTrigger, setRenderTrigger] = useState(0);

  // 初始化或 rawData 变更时，执行唯一一次深层遍历
  useEffect(() => {
    engineRef.current = flattenTreeData(rawData, defaultExpandAll);
    setRenderTrigger(prev => prev + 1);
  }, [rawData, defaultExpandAll]);

  // 获取需要在屏幕上显示的行 (过滤掉被隐藏的节点)
  const visibleNodes = useMemo(() => {
    return engineRef.current.flatList.filter(node => !node._isHidden);
  }, [renderTrigger]); // 仅当 trigger 变化时重新计算

  // 核心交互：极速展开/折叠节点 (时间复杂度极低，纯数组遍历)
  const toggleNode = (id: string | number) => {
    const { flatList, nodeMap } = engineRef.current;
    const node = nodeMap[id];

    if (!node || !node._hasChildren) return;

    // 1. 切换自身的展开状态
    node._isExpanded = !node._isExpanded;

    // 2. 级联更新所有子孙节点的可见性 (核心黑魔法)
    const startIndex = flatList.findIndex(n => n.id === id) + 1;
    for (let i = startIndex; i < flatList.length; i++) {
      const current = flatList[i];
      // 如果当前节点的深度 <= 目标节点深度，说明已经走出了子孙范围，立刻终止循环
      if (current._depth <= node._depth) break;

      // 判断可见性：一个节点如果想显示，它的父节点必须没有被隐藏，且父节点必须是展开状态
      const parent = nodeMap[current._parentId!];
      current._isHidden = parent._isHidden || !parent._isExpanded;
    }

    // 3. 强制触发 React 重新渲染
    setRenderTrigger(prev => prev + 1);
  };

  return {
    visibleNodes,
    toggleNode,
  };
}