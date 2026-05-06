/**
 * @file QM-UI Component
 * @version 1.0.0
 * @author QM-UI Team
 */

import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { BaseGridEngine, type GridColumn } from '../core/BaseGridEngine';

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
  isActive, // 接收引擎传来的焦点状态
  onChange,
  onValidate
}: {
  value: any;
  hasError: boolean;
  isJustScanned: boolean;
  isActive: boolean;
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

  // 核心修复：处理真实的 DOM 焦点夺取
  useEffect(() => {
    if (editMode !== 'none' && inputRef.current) {
      inputRef.current.focus();
      if (isJustScanned) inputRef.current.select();
    } else if (editMode === 'none' && isActive && cellRef.current) {
      // 只有在 editMode 为 none 且被引擎标为 isActive 时，才夺取焦点
      cellRef.current.focus();
    }
  }, [editMode, isJustScanned, isActive]);

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
      if (editMode === 'deep') {
        e.stopPropagation();
      } else if (editMode === 'quick') {
        handleSave(); 
      }
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
        className={`w-full h-full bg-blue-50 text-neutral-title text-center focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${hasError ? 'text-danger-500 font-bold' : ''}`}
      />
    );
  }

  return (
    <div
      ref={cellRef}
      tabIndex={-1}
      onDoubleClick={() => setEditMode('deep')} 
      onKeyDown={handleCellKeyDown}
      className={`w-full h-full flex items-center justify-center cursor-text transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-blue-50/50 ${hasError ? 'text-danger-500 font-bold underline decoration-wavy' : 'text-neutral-title'}`}
    >
      {value}
    </div>
  );
};

export const DataEntryGrid = () => {
  const [data, setData] = useState<InventoryRecord[]>([
    { id: 'R001', code: 'WE-001', name: 'Safe Box-Front', qty: 12 },
    { id: 'R002', code: 'WE-002', name: 'Safe Box-Back', qty: 5 },
    { id: 'R003', code: 'WE-003', name: 'Mainboard-V1', qty: '23a' }, 
    { id: 'R004', code: 'WE-004', name: 'Mainboard-V2', qty: 8 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({
    '2-qty': 'Must be a number' 
  });

  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [isDockActive, setIsDockActive] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const errorCount = Object.keys(errors).length;
  const isReadyToSubmit = errorCount === 0;

  const dockedRowKeys = isDockActive 
    ? Object.keys(errors).map(key => {
        const rowIndex = key.split('-')[0];
        return data[Number(rowIndex)]?.id;
      }).filter(Boolean)
    : [];

  useEffect(() => {
    if (isDockActive && errorCount > 0) {
      setTimeout(() => {
        const scrollContainer = gridContainerRef.current?.querySelector('.overflow-auto');
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 0);
    }
  }, [isDockActive, errorCount]);

  useEffect(() => {
    if (errorCount === 0 && isDockActive) {
      setIsDockActive(false);
    }
  }, [errorCount, isDockActive]);

  const handleSimulateScan = () => {
    const newId = `R00${data.length + 1}`;
    const newRecord: InventoryRecord = {
      id: newId,
      code: `WE-00${data.length + 1}`,
      name: 'Scanned Item',
      qty: 1, 
    };
    setData([...data, newRecord]);
    setLastScannedId(newId);
  };

  const handleCellChange = (rowIndex: number, field: keyof InventoryRecord, newValue: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [field]: newValue };
    setData(newData);
  };

  const handleValidate = (rowIndex: number, field: keyof InventoryRecord, value: string) => {
    const errorKey = `${rowIndex}-${field as string}`;
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

  // 核心修复：接收并派发 isActive[cite: 2]
  const generateEditableColumn = (key: keyof InventoryRecord, title: string, width?: string, align?: 'left' | 'center' | 'right'): GridColumn<InventoryRecord> => ({
    key: key as string,
    title,
    width,
    align,
    render: (record, rowIndex, colIndex, isActive) => {
      const errorKey = `${rowIndex}-${key as string}`;
      const isJustScanned = record.id === lastScannedId && key === 'qty'; 

      return (
        <EditableCell
          value={record[key]}
          hasError={!!errors[errorKey]}
          isJustScanned={isJustScanned}
          isActive={isActive} // 关键传递点
          onChange={(val) => handleCellChange(rowIndex, key, val)}
          onValidate={(val) => handleValidate(rowIndex, key, val)}
        />
      );
    }
  });

  const columns: GridColumn<InventoryRecord>[] = [
    generateEditableColumn('id', 'Row ID', '100px'),
    generateEditableColumn('code', 'Item Code', '200px', 'left'),
    generateEditableColumn('name', 'Item Name', 'auto', 'left'),
    generateEditableColumn('qty', 'Qty', '150px'),
  ];

  return (
    <div className="bg-white shadow-xl flex flex-col h-[600px] rounded-lg overflow-hidden border border-neutral-divider text-left">
      <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-divider bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-neutral-title">High-Speed Entry Grid</h2>
          <p className="text-xs text-neutral-muted mt-1">Navigate with Arrow keys. Press Enter to edit. Esc to cancel.</p>
        </div>
        <button 
          onClick={handleSimulateScan}
          className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
        >
          Simulate Scan
        </button>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden p-6" ref={gridContainerRef}>
        <BaseGridEngine
          data={data}
          columns={columns}
          rowKey="id"
          errors={errors}
          dockedRowKeys={dockedRowKeys} 
          features={{ showCrosshair: true, enableDock: true, enableKeyboardNav: true }}
        />
      </div>

      <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-divider bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 font-medium">{data.length} records scanned</span>
          
          {errorCount > 0 && (
            <button
              onClick={() => setIsDockActive(!isDockActive)}
              className={`
                flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer select-none
                ${isDockActive 
                  ? 'border-red-500 bg-red-500 text-white scale-105' 
                  : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                }
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDockActive ? 'bg-white' : 'bg-red-500'}`}></span>
              <span>{errorCount} Errors </span>
            </button>
          )}
        </div>

        <button
          disabled={!isReadyToSubmit}
          className={`px-8 py-2.5 rounded text-sm font-medium transition-all duration-300 ${
            isReadyToSubmit
              ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md cursor-pointer transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-neutral-muted cursor-not-allowed opacity-70'
          }`}
        >
          Submit Batch
        </button>
      </div>
    </div>
  );
};