// src/core/GridRenderEngine.tsx
import React from 'react';
import { gridTheme } from './theme';
import type { GridMode } from './BaseGridEngine';

export interface RenderEngineProps<T> {
  mode: GridMode; renderList: T[]; columns: any[]; rowKey: string; activeCell: any; dragState: any;
  onCellClick: (row: number, col: number) => void;
  onDragStart?: (e: React.DragEvent, record: T) => void;
  onDragOver?: (e: React.DragEvent, record: T) => void;
  onDrop?: (e: React.DragEvent, recordId: string) => void;
}

export function GridRenderEngine<T extends Record<string, any>>({
  mode, renderList, columns, rowKey, activeCell, dragState, onCellClick, onDragStart, onDragOver, onDrop
}: RenderEngineProps<T>) {

  return (
    // 🔥 修复点 1：独立的滚动层
    <div className={gridTheme.scrollWrapper}>
      {/* 🔥 修复点 2：统一的画布宽度 */}
      <div className={gridTheme.tableWrapper}>
        
        <div className={gridTheme.headerWrapper}>
          {columns.map((col: any) => {
            // 🔥 修复点 3：极其严格的 Flex 宽度约束，拒绝 auto 带来的坍塌
            const flexStyle = col.width === 'auto' ? { flex: '1 1 0%' } : { flex: `0 0 ${col.width}`, width: col.width };
            return (
              <div key={col.key} style={flexStyle} className={`${gridTheme.headerCell} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                {col.title}
              </div>
            );
          })}
        </div>

        <div className={gridTheme.bodyWrapper}>
          {renderList.map((record, rIdx) => {
            const rId = String(record[rowKey] || record._originalId);
            const isTarget = dragState.targetId === rId;
            const isDragging = dragState.draggedId === rId;
            
            let rowClass = `${gridTheme.rowNormal} ${isDragging ? gridTheme.rowDragging : ''} ${isTarget && dragState.position === 'inside' ? gridTheme.rowDropTargetInside : ''}`;
            let dropStyle: React.CSSProperties = {};
            if (isTarget) {
              if (dragState.position === 'before') dropStyle = { boxShadow: gridTheme.dropIndicatorBefore };
              if (dragState.position === 'after') dropStyle = { boxShadow: gridTheme.dropIndicatorAfter };
            }

            return (
              <div key={rId} draggable={mode === 'tree'} className={rowClass} style={dropStyle}
                   onDragStart={(e) => onDragStart?.(e, record)} onDragOver={(e) => onDragOver?.(e, record)} onDrop={(e) => onDrop?.(e, rId)}>
                {columns.map((col: any, cIdx: number) => {
                  const isActive = activeCell?.row === rIdx && activeCell?.col === cIdx;
                  const flexStyle = col.width === 'auto' ? { flex: '1 1 0%' } : { flex: `0 0 ${col.width}`, width: col.width };
                  
                  return (
                    <div key={col.key} style={flexStyle} 
                         className={`${gridTheme.cellNormal} ${isActive ? gridTheme.cellActive : ''} ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}
                         onClick={() => onCellClick(rIdx, cIdx)}>
                      {col.render(record, rIdx, cIdx, isActive)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}