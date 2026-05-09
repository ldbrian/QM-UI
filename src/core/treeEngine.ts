// treeEngine.ts

// ==========================================
// 1. 数据模型定义 (Data Models)
// ==========================================

/**
 * 用户传入的原始业务数据 (松散、不可靠)
 */
export interface RawTreeNode {
  id: string | number;       // 必须有唯一标识
  children?: RawTreeNode[];  // 可能有，可能没有
  [key: string]: any;        // 允许挂载其他任意业务字段 (name, price, etc.)
}

/**
 * 引擎内部运转的 1D 节点模型 (严格、携带内部状态)
 */
export interface InternalTreeNode {
  id: string | number;
  raw: RawTreeNode;          // 挂载原始数据引用，渲染层可直接读取业务字段
  
  // --- 核心状态机字段 ---
  _depth: number;            // 深度：用于计算 UI 层的 padding-left 缩进
  _hasChildren: boolean;     // 是否有子节点：用于判断是否渲染 [+] [-] 展开图标
  _parentId: string | number | null; // 父节点 ID：用于按左键 [←] 时焦点快速跳回父级
  
  _isExpanded: boolean;      // 状态：当前节点是否处于展开状态
  _isHidden: boolean;        // 状态：当前节点是否在视口中隐藏（如果它的任何祖先被折叠，此值为 true）
}


// ==========================================
// 2. 核心数据引擎 (Core Engine)
// ==========================================

/**
 * 核心拍平引擎：将嵌套 JSON 瞬间转换为一维状态数组和 O(1) 哈希字典
 * @param rawData 原始树形数组
 * @param defaultExpandAll 是否默认展开所有节点 (默认 false)
 */
export function flattenTreeData(
  rawData: RawTreeNode[],
  defaultExpandAll: boolean = false
): {
  flatList: InternalTreeNode[];
  nodeMap: Record<string | number, InternalTreeNode>;
} {
  const flatList: InternalTreeNode[] = [];
  const nodeMap: Record<string | number, InternalTreeNode> = {};

  // 内部深度优先递归遍历函数
  function traverse(
    nodes: RawTreeNode[],
    depth: number,
    parentId: string | number | null,
    isParentExpanded: boolean
  ) {
    nodes.forEach((node) => {
      // 严谨判断：存在 children 字段且是个数组且长度大于0
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const isExpanded = defaultExpandAll; // 初始展开状态
      
      // 核心防错逻辑：如果父节点没有展开，那么当前节点必须被标记为隐藏
      const isHidden = !isParentExpanded;

      // 组装内部节点数据
      const internalNode: InternalTreeNode = {
        id: node.id,
        raw: node,
        _depth: depth,
        _isExpanded: isExpanded,
        _hasChildren: hasChildren,
        _parentId: parentId,
        _isHidden: isHidden,
      };

      // 压入一维数组，并注册到哈希字典
      flatList.push(internalNode);
      nodeMap[node.id] = internalNode;

      // 如果有子节点，继续往下钻 (递归)
      if (hasChildren) {
        // 只有当前节点可见(没被隐藏)且自身也处于展开状态时，它的子节点才应该可见
        const childrenShouldBeVisible = !isHidden && isExpanded;
        traverse(node.children!, depth + 1, node.id, childrenShouldBeVisible);
      }
    });
  }

  // 启动引擎！根节点的父级可以视为永远展开的 (isParentExpanded = true)
  traverse(rawData, 0, null, true);

  return { flatList, nodeMap };
}