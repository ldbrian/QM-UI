/**
 * @file QM-UI Component
 * @version 2.0.0 (V2 Engine Adapted)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BaseGridEngine, type GridColumn, type CellContext } from '../core/BaseGridEngine';

interface InventoryRecord {
  id: string;
  code: string;
  name: string;
  qty: number | string;
  [key: string]: any; 
}

const EditableCell = ({
  value,
  hasError,
  isJustScanned,
  ctx,
  onChange,
  onValidate
}: {
  value: any;
  hasError: boolean;
  isJustScanned: boolean;
  ctx: CellContext;
  onChange: (val: string) => void;
  onValidate: (val: string) => string | null;
}) => {
  const [editMode, setEditMode] = useState<'none' | 'quick' | 'deep'>(isJustScanned ? 'deep' : 'none');
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // V2 引擎焦点夺取
  useEffect(() => {
    if (editMode !== 'none' && inputRef.current) {
      inputRef.current.focus();
      if (isJustScanned) inputRef.current.select();
    } else if (editMode === 'none' && ctx.isActive && cellRef.current) {
      cellRef.current.focus();
    }
  }, [editMode, isJustScanned, ctx.isActive]);

  const handleSave = () => {
    setEditMode('none');
    onChange(localValue);
    onValidate(localValue);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editMode !== 'none') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditMode('deep'); 
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setLocalValue(e.key);
      setEditMode('quick');
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditMode('none');
      setLocalValue(value); 
      e.stopPropagation();
    } else if (e.key.startsWith('Arrow')) {
      if (editMode === 'deep') e.stopPropagation();
      else if (editMode === 'quick') handleSave(); 
    }
  };

  if (editMode !== 'none') {
    return (
      <input
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        onBlur={handleSave}
        className={`absolute inset-0 w-full h-full px-4 bg-blue-50 text-neutral-900 font-bold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all ${hasError ? 'text-red-600' : ''}`}
        style={{ textAlign: 'center' }}
      />
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={-1}
      onDoubleClick={() => setEditMode('deep')} 
      onKeyDown={handleCellKeyDown}
      className={`w-full truncate cursor-text focus:outline-none ${hasError ? 'text-red-500 font-bold underline decoration-wavy' : 'text-gray-800'}`}
    >
      {value}
    </div>
  );
};

export const DataEntryGrid = () => {
  const [data, setData] = useState<InventoryRecord[]>([
    { id: 'R001', code: 'B08F6B9GD1', name: 'Anker 10000mAh Power Bank', qty: 120 },
    { id: 'R002', code: 'B09J8P9A3D', name: 'Logitech MX Master 3S', qty: 45 },
    { id: 'R003', code: 'B07WNV5D6C', name: 'Apple AirPods Pro (2nd Gen)', qty: '23a' }, // 故意留错，演示 Error Dock 拦截
    { id: 'R004', code: 'B08N5M7S6Z', name: 'iPhone 15 Pro Silicone Case', qty: 85 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({
    'R003-qty': 'Must be a number' 
  });

  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [isDockActive, setIsDockActive] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const errorCount = Object.keys(errors).length;
  const isReadyToSubmit = errorCount === 0;

  // 🔥 V2 架构：业务层接管吸底逻辑 (将报错的行重新排序到数组末尾)
  const displayData = useMemo(() => {
    if (!isDockActive) return data;
    const errorIds = Object.keys(errors).map(k => k.split('-')[0]);
    const normalRows = data.filter(d => !errorIds.includes(d.id));
    const dockedRows = data.filter(d => errorIds.includes(d.id));
    return [...normalRows, ...dockedRows];
  }, [data, errors, isDockActive]);

  useEffect(() => {
    if (isDockActive && errorCount > 0) {
      setTimeout(() => {
        const scrollContainer = gridContainerRef.current?.querySelector('.overflow-auto');
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
        }
      }, 0);
    }
    if (errorCount === 0 && isDockActive) setIsDockActive(false);
  }, [isDockActive, errorCount]);

  const handleSimulateScan = () => {
    const newId = `R00${data.length + 1}`;
    setData([...data, { id: newId, code: `WE-00${data.length + 1}`, name: 'Scanned Item', qty: 1 }]);
    setLastScannedId(newId);
  };

  const handleCellChange = (id: string, field: keyof InventoryRecord, newValue: string) => {
    setData(prev => prev.map(row => row.id === id ? { ...row, [field]: newValue } : row));
  };

  const handleValidate = (id: string, field: keyof InventoryRecord, value: string) => {
    const errorKey = `${id}-${field as string}`;
    const newErrors = { ...errors };

    if (field === 'qty' && (isNaN(Number(value)) || String(value).trim() === '')) {
      newErrors[errorKey] = 'Must be a number';
    } else if (String(value).trim() === '') {
      newErrors[errorKey] = 'Cannot be empty';
    } else {
      delete newErrors[errorKey];
    }
    setErrors(newErrors);
    return newErrors[errorKey] || null;
  };

  const generateEditableColumn = (key: keyof InventoryRecord, title: string, width?: string, align?: 'left' | 'center' | 'right'): GridColumn<InventoryRecord> => ({
    key: key as string, title, width, align,
    render: (record, ctx) => {
      const errorKey = `${record.id}-${key as string}`;
      return (
        <EditableCell
          value={record[key]}
          hasError={!!errors[errorKey]}
          isJustScanned={record.id === lastScannedId && key === 'qty'}
          ctx={ctx}
          onChange={(val) => handleCellChange(record.id, key, val)}
          onValidate={(val) => handleValidate(record.id, key, val)}
        />
      );
    }
  });

  const columns: GridColumn<InventoryRecord>[] = [
    generateEditableColumn('id', 'Row ID', '100px', 'center'),
    generateEditableColumn('code', 'Item Code', '200px', 'left'),
    generateEditableColumn('name', 'Item Name', 'auto', 'left'),
    generateEditableColumn('qty', 'Qty', '150px', 'center'),
  ];

  return (
    <div className="bg-white shadow-xl flex flex-col h-[600px] rounded-lg overflow-hidden border border-gray-200 text-left relative font-sans">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">High-Speed Entry Grid</h2>
          <p className="text-xs text-gray-500 mt-1">Navigate with Arrow keys. Press Enter to edit. Esc to cancel.</p>
        </div>
        <button 
          onClick={handleSimulateScan}
          className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
        >
          Simulate Scan
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden" ref={gridContainerRef}>
        <BaseGridEngine mode="entry" data={displayData} columns={columns} rowKey="id" />
      </div>

      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 font-medium">{data.length} records scanned</span>
          {errorCount > 0 && (
            <button
              onClick={() => setIsDockActive(!isDockActive)}
              className={`flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all shadow-sm select-none ${isDockActive ? 'border-red-500 bg-red-500 text-white scale-105' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDockActive ? 'bg-white' : 'bg-red-500'}`}></span>
              <span>{errorCount} Errors Docked</span>
            </button>
          )}
        </div>
        <button
          disabled={!isReadyToSubmit}
          className={`px-8 py-2.5 rounded text-sm font-medium transition-all duration-300 ${isReadyToSubmit ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'}`}
        >
          Submit Batch
        </button>
      </div>
    </div>
  );
};