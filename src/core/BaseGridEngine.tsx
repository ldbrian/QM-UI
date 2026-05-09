// src/core/BaseGridEngine.tsx
import React, { useState, useRef, useMemo } from 'react';
import { useTreeGrid } from './useTreeGrid'; 
import { GridRenderEngine } from './GridRenderEngine';

export type GridMode = 'view' | 'entry' | 'action' | 'tree';

export interface CellContext {
  rowIndex: number;
  colIndex: number;
  isActive: boolean;
  isSelected: boolean;
  isIndeterminate?: boolean; // 🔥 新增：半选状态
  mode: GridMode;
  toggleSelect: () => void;
  toggleExpand: () => void;
}

export interface GridColumn<T> {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (record: T, context: CellContext) => React.ReactNode;
}

export interface BaseGridProps<T> {
  mode?: GridMode; 
  data: T[];
  columns: GridColumn<T>[];
  rowKey: string;
  onRowSelect?: (selectedKeys: string[]) => void;
  onTreeDrop?: (draggedId: string, targetId: string, position: 'before' | 'inside' | 'after') => void; 
}

export function BaseGridEngine<T extends Record<string, any>>({
  mode = 'view', data, columns, rowKey, onRowSelect, onTreeDrop
}: BaseGridProps<T>) {
  
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const isTreeMode = mode === 'tree';
  const { visibleNodes, toggleNode } = useTreeGrid(isTreeMode ? (data as any) : [], isTreeMode);
  
  const renderList = useMemo(() => {
    if (isTreeMode) {
      return visibleNodes.map(node => ({
        ...node.raw,
        _isExpanded: node._isExpanded,
        _hasChildren: node._hasChildren,
        _depth: node._depth,
        _originalId: node.id
      })) as unknown as T[];
    }
    return data;
  }, [isTreeMode, visibleNodes, data]);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // 🔥 辅助：计算半选状态 (Indeterminate)
  const getSelectionState = (record: any) => {
    const id = String(record[rowKey] || record._originalId);
    const isSelected = selectedKeys.includes(id);
    if (!isTreeMode || !record.children) return { isSelected, isIndeterminate: false };

    const collectAllLeafIds = (node: any): string[] => {
      let ids = [String(node.id || node[rowKey])];
      if (node.children) {
        node.children.forEach((c: any) => { ids = [...ids, ...collectAllLeafIds(c)]; });
      }
      return ids;
    };

    const allChildIds = collectAllLeafIds(record).filter(kid => kid !== id);
    if (allChildIds.length === 0) return { isSelected, isIndeterminate: false };

    const selectedChildren = allChildIds.filter(kid => selectedKeys.includes(kid));
    const isIndeterminate = selectedChildren.length > 0 && selectedChildren.length < allChildIds.length;
    
    return { isSelected: isSelected || selectedChildren.length === allChildIds.length, isIndeterminate };
  };
  
  const handleSelectToggle = (id: string) => {
    let newSelected = [...selectedKeys];
    if (isTreeMode) {
      const collectIds = (nodes: any[], targetId: string): string[] => {
        for (const n of nodes) {
          if (String(n.id) === targetId) {
            const getSubIds = (node: any): string[] => [String(node.id || node[rowKey]), ...(node.children?.flatMap(getSubIds) || [])];
            return getSubIds(n);
          }
          const found = n.children ? collectIds(n.children, targetId) : [];
          if (found.length > 0) return found;
        }
        return [];
      };
      const affected = collectIds(data, id);
      const isCurrentlySelected = selectedKeys.includes(id);
      newSelected = !isCurrentlySelected 
        ? Array.from(new Set([...selectedKeys, ...affected]))
        : selectedKeys.filter(k => !affected.includes(k));
    } else {
      newSelected = selectedKeys.includes(id) ? selectedKeys.filter(k => k !== id) : [...selectedKeys, id];
    }
    setSelectedKeys(newSelected);
    onRowSelect?.(newSelected);
  };

  const [dragState, setDragState] = useState<{ draggedId: string | null; targetId: string | null; position: 'before' | 'inside' | 'after' | null }>({ draggedId: null, targetId: null, position: null });
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!activeCell) return;
    const currentRecord = renderList[activeCell.row];
    const currentId = String(currentRecord[rowKey] || (currentRecord as any)._originalId);

    switch (e.key) {
      case 'ArrowUp': e.preventDefault(); setActiveCell(prev => ({ col: prev!.col, row: Math.max(0, prev!.row - 1) })); break;
      case 'ArrowDown': e.preventDefault(); setActiveCell(prev => ({ col: prev!.col, row: Math.min(renderList.length - 1, prev!.row + 1) })); break;
      case 'ArrowLeft': e.preventDefault(); setActiveCell(prev => ({ row: prev!.row, col: Math.max(0, prev!.col - 1) })); break;
      case 'ArrowRight': e.preventDefault(); setActiveCell(prev => ({ row: prev!.row, col: Math.min(columns.length - 1, prev!.col + 1) })); break;
      case ' ': 
        e.preventDefault();
        if (mode === 'tree' && activeCell.col === 1) toggleNode(currentId);
        else handleSelectToggle(currentId);
        break;
    }
  };

  return (
    <div className="w-full h-full outline-none flex flex-col" tabIndex={0} onKeyDown={handleKeyDown}>
      <GridRenderEngine 
        mode={mode}
        renderList={renderList}
        columns={columns.map(col => ({
          ...col,
          render: (record: T, rIdx: number, cIdx: number, isActive: boolean) => {
            const id = String(record[rowKey] || (record as any)._originalId);
            const { isSelected, isIndeterminate } = getSelectionState(record);
            return col.render(record, {
              rowIndex: rIdx, colIndex: cIdx, isActive, isSelected, isIndeterminate, mode,
              toggleSelect: () => handleSelectToggle(id),
              toggleExpand: () => toggleNode(id)
            });
          }
        }))}
        rowKey={rowKey}
        activeCell={activeCell}
        dragState={dragState}
        onCellClick={(row, col) => setActiveCell({ row, col })}
        onDragStart={(e, record) => {
          if (mode !== 'tree') return;
          const id = String(record[rowKey] || (record as any)._originalId);
          e.dataTransfer.setData('nodeId', id);
          // 🔥 修复：拖拽开始时收起当前节点
          if ((record as any)._isExpanded) toggleNode(id);
          setDragState({ draggedId: id, targetId: null, position: null });
        }}
        onDragOver={(e, record) => {
          if (mode !== 'tree') return;
          e.preventDefault();
          const targetId = String(record[rowKey] || (record as any)._originalId);
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const pos = y < rect.height * 0.25 ? 'before' : y > rect.height * 0.75 ? 'after' : 'inside';
          
          if (dragState.targetId !== targetId || dragState.position !== pos) {
            setDragState({ draggedId: dragState.draggedId, targetId, position: pos as any });
            
            // 🔥 修复：悬停 1 秒展开目标节点
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if ((record as any)._hasChildren && !(record as any)._isExpanded) {
              hoverTimerRef.current = setTimeout(() => {
                toggleNode(targetId);
                hoverTimerRef.current = null;
              }, 1000);
            }
          }
        }}
        onDrop={(e, targetId) => {
          if (mode !== 'tree') return;
          if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
          const draggedId = e.dataTransfer.getData('nodeId');
          onTreeDrop?.(draggedId, targetId, dragState.position as any);
          setDragState({ draggedId: null, targetId: null, position: null });
        }}
      />
    </div>
  );
}