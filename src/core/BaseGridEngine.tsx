import React, { useState, useCallback } from 'react';

export interface GridFeatures {
  showCrosshair?: boolean; 
  enableDock?: boolean;    
  enableKeyboardNav?: boolean; // 🔥 新增：全键盘矩阵导航开关
}

export interface GridColumn<T> {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'readonly'; 
  editable?: boolean;
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

  const getRowKey = useCallback((record: T, index: number) => {
    if (typeof rowKey === 'function') return rowKey(record);
    return String(record[rowKey]);
  }, [rowKey]);

  const normalData = features.enableDock 
    ? data.filter((r, i) => !dockedRowKeys.includes(getRowKey(r, i)))
    : data;
  
  const dockedData = features.enableDock
    ? data.filter((r, i) => dockedRowKeys.includes(getRowKey(r, i)))
    : [];

  // 🔥 核心：全局键盘事件劫持
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!features.enableKeyboardNav || !activeCoord) return;

    const { row, col } = activeCoord;
    let nextRow = row;
    let nextCol = col;

    // 智能判定：如果当前在输入框里敲字，左右方向键让给文字光标，不触发跳格
    const isInput = (e.target as HTMLElement).tagName === 'INPUT';

    switch (e.key) {
      case 'ArrowUp':
        nextRow = row - 1;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'Enter': // Excel 习惯：回车向下跳
        nextRow = row + 1;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        if (isInput) return; 
        nextCol = col - 1;
        e.preventDefault();
        break;
      case 'ArrowRight':
        if (isInput) return;
        nextCol = col + 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    // 越界保护
    if (nextRow < 0 || nextRow >= data.length || nextCol < 0 || nextCol >= columns.length) return;

    // 🔥 DOM 级焦点暴击：利用 data-属性 跨越普通区和Dock区，精准制导！
    const nextCell = document.querySelector(`td[data-row="${nextRow}"][data-col="${nextCol}"]`) as HTMLElement;
    if (nextCell) {
      // 优先聚焦单元格内部的输入框，否则聚焦单元格本身
      const focusableInput = nextCell.querySelector('input, button, select') as HTMLElement;
      if (focusableInput) {
        focusableInput.focus();
        // 如果是 input，跳过去自动全选
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
        className={`
          border-b border-neutral-border h-10 transition-colors
          ${isDocked ? 'bg-gray-50' : 'hover:bg-gray-50'} 
        `}
      >
        {columns.map((col, colIndex) => {
          const cellId = `${originalIndex}-${col.key}`;
          const hasError = !!errors[cellId];
          const isCrosshairActive = features.showCrosshair && activeCoord?.row === originalIndex && activeCoord?.col === colIndex;
          const isRowActive = features.showCrosshair && activeCoord?.row === originalIndex;
          const isColActive = features.showCrosshair && activeCoord?.col === colIndex;

          return (
            <td 
              key={col.key} 
              // 🔥 注入物理坐标系
              data-row={originalIndex}
              data-col={colIndex}
              tabIndex={col.render ? -1 : 0}
              onFocusCapture={() => setActiveCoord({ row: originalIndex, col: colIndex })}
              onBlurCapture={() => setActiveCoord(null)}
              className={`
                border-r border-neutral-border px-3 truncate relative transition-all duration-75 outline-none
                ${hasError ? 'border-2 border-danger-border bg-danger-bg/10 z-10' : ''}
                ${isCrosshairActive ? 'ring-2 ring-primary-500 ring-inset bg-blue-50 z-20' : ''}
                ${!isCrosshairActive && isRowActive ? 'bg-blue-50/60 shadow-[0_-1px_0_0_#e6f4ff,0_1px_0_0_#e6f4ff] z-10' : ''}
                ${!isCrosshairActive && isColActive ? 'bg-blue-50/60 shadow-[-1px_0_0_0_#e6f4ff,1px_0_0_0_#e6f4ff] z-10' : ''}
                ${col.editable === false || col.type === 'readonly' ? 'bg-gray-50/50 text-gray-600 focus:bg-white' : ''}
              `}
              style={{ textAlign: col.align || 'center' }}
            >
              {hasError && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-danger-border rounded-full transform translate-x-1/2 -translate-y-1/2 shadow-sm animate-pulse"></div>
              )}
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
      <div 
        className="flex-1 overflow-auto relative"
        // 🔥 将事件绑定在滚动容器上，接管内部所有键盘行为
        onKeyDown={handleKeyDown}
      >
        <table className="w-full text-sm font-tabular text-neutral-text border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 sticky top-0 z-30 shadow-sm">
            <tr className="text-neutral-title border-b border-neutral-divider h-10">
              {columns.map((col, colIndex) => (
                <th 
                  key={col.key} 
                  className={`
                    font-medium border-r border-neutral-border px-3 transition-colors
                    ${features.showCrosshair && activeCoord?.col === colIndex ? 'bg-primary-50/50 text-primary-600' : ''}
                  `}
                  style={{ width: col.width, textAlign: col.align || 'center' }}
                >
                  {col.title}
                </th>
              ))}
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