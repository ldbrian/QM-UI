/**
 * @file QM-UI Component
 * @version 1.0.0
 * @author QM-UI Team
 * @license 
 * This source code is licensed under the QM-UI Commercial License.
 * You may use this code in commercial projects for yourself or your clients.
 * You may NOT redistribute, resell, or publish the source code itself.
 * * Copyright (c) 2026 QM-UI. All rights reserved.
 * * For full license details, visit: https://qm-ui.vercel.app/license
 */

// src/components/DataEntryGrid.tsx
import { useState, useEffect, useRef } from 'react';
import { BaseGridEngine, type GridColumn } from '../core/BaseGridEngine';

interface InventoryRecord {
  id: string;
  code: string;
  name: string;
  qty: number | string;
}

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

  const columns: GridColumn<InventoryRecord>[] = [
    { key: 'id', title: 'Row ID', width: '100px', type: 'readonly' },
    { key: 'code', title: 'Item Code', width: '200px', align: 'left', type: 'readonly' },
    { key: 'name', title: 'Item Name', align: 'left', type: 'readonly' },
    {
      key: 'qty',
      title: 'Qty (Editable)',
      width: '150px',
      render: (record, rowIndex) => {
        const errorKey = `${rowIndex}-qty`;
        const hasError = !!errors[errorKey];
        const isJustScanned = record.id === lastScannedId;

        return (
          <input
            autoFocus={isJustScanned}
            onFocus={(e) => e.target.select()}
            className={`
              w-full h-full bg-transparent text-center focus:outline-none focus:font-bold transition-all
              ${hasError ? 'text-danger-border font-bold' : 'text-neutral-title'}
            `}
            value={record.qty}
            onChange={(e) => {
              const newData = [...data];
              newData[rowIndex].qty = e.target.value;
              setData(newData);
            }}
            onBlur={(e) => {
              const val = e.target.value;
              const newErrors = { ...errors };
              if (isNaN(Number(val)) || val.trim() === '') {
                newErrors[errorKey] = 'Must be a number';
              } else {
                delete newErrors[errorKey];
              }
              setErrors(newErrors);
            }}
          />
        );
      }
    },
  ];

  return (
    <div className="bg-white shadow-xl flex flex-col h-[600px] rounded-lg overflow-hidden border border-neutral-divider text-left">
      <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-divider bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-neutral-title">High-Speed Entry Grid</h2>
          <p className="text-xs text-neutral-muted mt-1">Try clicking read-only cells and use Tab/Arrow keys to navigate.</p>
        </div>
        <button 
          onClick={handleSimulateScan}
          className="px-4 py-2 bg-gray-800 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm flex items-center gap-2"
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