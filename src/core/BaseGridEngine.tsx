import React, { useState, useCallback } from 'react';

export interface GridFeatures {
  showCrosshair?: boolean; 
  enableDock?: boolean;    
  enableKeyboardNav?: boolean; 
}

export interface GridColumn<T> {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'readonly'; 
  editable?: boolean;
  fixed?: 'left' | 'right';
  render?: (record: T, rowIndex: number) => React.ReactNode; 
}

export interface BaseGridProps<T = any> {
  columns: GridColumn<T>[];
  data: T[];
  rowKey: keyof T | ((record: T) => string); 
  errors?: Record<string, string>; 
  dockedRowKeys?: string[]; 
  features?: GridFeatures;  
}

export const BaseGridEngine = <T extends any>({ 
  columns, 
  data, 
  rowKey,
  errors = {},
  dockedRowKeys = [],
  features = { showCrosshair: false, enableDock: false, enableKeyboardNav: true }
}: BaseGridProps<T>) => {

  const [activeCoord, setActiveCoord] = useState<{row: number, col: number} | null>(null);

  const getRowKey = useCallback((record: T, _index: number) => {
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey]);
  }, [rowKey]);

  const normalData = features.enableDock 
    ? data.filter((r, i) => !dockedRowKeys.includes(getRowKey(r, i)))
    : data;
  
  const dockedData = features.enableDock
    ? data.filter((r, i) => dockedRowKeys.includes(getRowKey(r, i)))
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!features.enableKeyboardNav || !activeCoord) return;

    const { row, col } = activeCoord;
    let nextRow = row;
    let nextCol = col;
    const isInput = (e.target as HTMLElement).tagName === 'INPUT';

    switch (e.key) {
      case 'ArrowUp': nextRow = row - 1; e.preventDefault(); break;
      case 'ArrowDown':
      case 'Enter': nextRow = row + 1; e.preventDefault(); break;
      case 'ArrowLeft': if (isInput) return; nextCol = col - 1; e.preventDefault(); break;
      case 'ArrowRight': if (isInput) return; nextCol = col + 1; e.preventDefault(); break;
      default: return;
    }

    if (nextRow < 0 || nextRow >= data.length || nextCol < 0 || nextCol >= columns.length) return;

    const nextCell = document.querySelector(`td[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLElement;
    if (nextCell) {
      const focusableInput = nextCell.querySelector('input, button, select') as HTMLElement;
      if (focusableInput) {
        focusableInput.focus();
        if (focusableInput.tagName === 'INPUT') (focusableInput as HTMLInputElement).select();
      } else {
        nextCell.focus();
      }
    }
  };

  const renderRow = (record: T, originalIndex: number, isDocked: boolean = false) => {
    const currentKey = getRowKey(record, originalIndex);
    
    return (
      <tr 
        key={currentKey} 
        className={`border-b border-neutral-border h-10 transition-colors ${isDocked ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
      >
        {columns.map((col, colIndex) => {
          const cellId = `${originalIndex}-${col.key}`;
          const hasError = !!errors[cellId];
          const isCrosshairActive = features.showCrosshair && activeCoord?.row === originalIndex && activeCoord?.col === colIndex;
          const isRowActive = features.showCrosshair && activeCoord?.row === originalIndex;
          const isColActive = features.showCrosshair && activeCoord?.col === colIndex;

          // 处理物理冻结样式
          const isFixed = !!col.fixed;
          const fixedStyles = isFixed ? {
            position: 'sticky' as const,
            [col.fixed!]: 0,
            zIndex: isCrosshairActive ? 25 : 15,
            boxShadow: col.fixed === 'left' ? '2px 0 5px -2px rgba(0,0,0,0.1)' : '-2px 0 5px -2px rgba(0,0,0,0.1)',
            backgroundColor: 'inherit'
          } : {};

          return (
            <td 
              key={col.key} 
              data-row={originalIndex}
              data-col={colIndex}
              tabIndex={col.render ? -1 : 0}
              onFocusCapture={() => setActiveCoord({ row: originalIndex, col: colIndex })}
              onBlurCapture={() => setActiveCoord(null)}
              className={`
                border-r border-neutral-border px-3 truncate relative transition-all duration-75 outline-none bg-transparent
                ${hasError ? 'border-2 border-danger-border bg-danger-bg/10 z-10' : ''}
                ${isCrosshairActive ? 'ring-2 ring-primary-500 ring-inset bg-blue-50 z-20' : ''}
                ${!isCrosshairActive && isRowActive ? 'bg-blue-50/60 shadow-[0_-1px_0_0_#e6f4ff,0_1px_0_0_#e6f4ff] z-10' : ''}
                ${!isCrosshairActive && isColActive ? 'bg-blue-50/60 shadow-[-1px_0_0_0_#e6f4ff,1px_0_0_0_#e6f4ff] z-10' : ''}
                ${(col.editable === false || col.type === 'readonly') && !isFixed && !isCrosshairActive && !isRowActive && !isColActive ? 'bg-gray-50/50 text-gray-600' : ''}
                ${(col.editable === false || col.type === 'readonly') && isFixed ? 'text-gray-600' : ''}
                ${(col.editable === false || col.type === 'readonly') && (isCrosshairActive || isRowActive || isColActive) ? 'text-gray-600' : ''}
              `}
              style={{ textAlign: col.align || 'center', ...fixedStyles }}
            >
              {hasError && <div className="absolute top-0 right-0 w-2 h-2 bg-danger-border rounded-full transform translate-x-1/2 -translate-y-1/2 shadow-sm animate-pulse"></div>}
              <div className="w-full h-full flex items-center justify-center">
                {col.render ? col.render(record, originalIndex) : (record as any)[col.key] || '-'}
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="w-full overflow-hidden bg-white border border-neutral-border rounded-md shadow-sm flex flex-col h-full">
      <div className="flex-1 overflow-auto relative" onKeyDown={handleKeyDown}>
        {/* 增加 minWidth 确保冻结列在容器不够宽时也能生效滚动 */}
        <table className="w-full text-sm font-tabular text-neutral-text border-collapse" style={{ tableLayout: 'fixed', minWidth: '100%' }}>
          <thead className="bg-gray-50 sticky top-0 z-30 shadow-sm">
            <tr className="text-neutral-title border-b border-neutral-divider h-10">
              {columns.map((col, colIndex) => {
                // 表头冻结列处理
                const isFixed = !!col.fixed;
                const fixedStyles = isFixed ? {
                  position: 'sticky' as const,
                  [col.fixed!]: 0,
                  zIndex: 35,
                  boxShadow: col.fixed === 'left' ? '2px 0 5px -2px rgba(0,0,0,0.1)' : '-2px 0 5px -2px rgba(0,0,0,0.1)'
                } : {};

                return (
                  <th 
                    key={col.key} 
                    className={`
                      font-medium border-r border-neutral-border px-3 transition-colors bg-gray-50
                      ${features.showCrosshair && activeCoord?.col === colIndex ? 'bg-primary-50/50 text-primary-600' : ''}
                    `}
                    style={{ width: col.width, textAlign: col.align || 'center', ...fixedStyles }}
                  >
                    {col.title}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {normalData.map((record) => {
              const originalIndex = data.findIndex(r => getRowKey(r, 0) === getRowKey(record, 0));
              return renderRow(record, originalIndex);
            })}
          </tbody>
          {features.enableDock && dockedData.length > 0 && (
            <tbody className="relative z-20">
              <tr className="bg-gray-200 h-1.5">
                <td colSpan={columns.length} className="p-0 border-t-2 border-b-2 border-gray-300"></td>
              </tr>
              {dockedData.map((record) => {
                const originalIndex = data.findIndex(r => getRowKey(r, 0) === getRowKey(record, 0));
                return renderRow(record, originalIndex, true);
              })}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};