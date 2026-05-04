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

// src/components/DataViewGrid.tsx
import { useState, useRef, useEffect } from 'react';
import { BaseGridEngine, type GridColumn } from '../core/BaseGridEngine';

interface InventoryViewRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  bin: string;
  qty: number;
  safetyStock: number;
  status: 'healthy' | 'low' | 'out';
}

interface DownstreamAction {
  key: string;
  label: string;
  isPrimary?: boolean;
  onClick: (selectedRecords: InventoryViewRecord[]) => void;
}

export const DataViewGrid = () => {
  const [data] = useState<InventoryViewRecord[]>([
    { id: 'R001', code: 'WE-001', name: 'Safe Box-Front', category: 'Hardware', bin: 'A-12-01', qty: 120, safetyStock: 50, status: 'healthy' },
    { id: 'R002', code: 'WE-002', name: 'Safe Box-Back', category: 'Hardware', bin: 'A-12-02', qty: 8, safetyStock: 50, status: 'low' },
    { id: 'R003', code: 'WE-003', name: 'Mainboard-V1', category: 'Electronics', bin: 'B-04-15', qty: 0, safetyStock: 20, status: 'out' },
    { id: 'R004', code: 'WE-004', name: 'Mainboard-V2', category: 'Electronics', bin: 'B-04-16', qty: 0, safetyStock: 15, status: 'out' },
    { id: 'R005', code: 'WE-005', name: 'Sensor Array', category: 'Sensors', bin: 'C-01-99', qty: 300, safetyStock: 100, status: 'healthy' },
  ]);

  // 🔥 升级为数组：支持多个状态同时吸底
  const [activeDockStatuses, setActiveDockStatuses] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const outCount = data.filter(d => d.status === 'out').length;
  const lowCount = data.filter(d => d.status === 'low').length;

  // 动态计算所有符合当前激活状态的行键
  const dockedRowKeys = activeDockStatuses.length > 0 
    ? data.filter(d => activeDockStatuses.includes(d.status)).map(d => d.id)
    : [];

  useEffect(() => {
    if (activeDockStatuses.length > 0 && dockedRowKeys.length > 0) {
      setTimeout(() => {
        const scrollContainer = gridContainerRef.current?.querySelector('.overflow-auto');
        if (scrollContainer) scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }, 0);
    }
  }, [activeDockStatuses]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const configuredActions: DownstreamAction[] = [
    {
      key: 'export',
      label: 'Export List',
      isPrimary: false,
      onClick: (selected) => alert(`Exporting ${selected.length} items to Excel...`)
    },
    {
      key: 'po',
      label: 'Create Purchase Order',
      isPrimary: true,
      onClick: (selected) => {
        alert(`Routing ${selected.length} items to Purchase Order workflow...`);
        setSelectedKeys([]);
      }
    }
  ];

  // 🔥 上下文感知的全选逻辑
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // 如果当前有吸底状态，只全选被吸底的异常物料；否则全量选择
      const keysToSelect = activeDockStatuses.length > 0 ? dockedRowKeys : data.map(d => d.id);
      setSelectedKeys(keysToSelect);
    } else {
      setSelectedKeys([]);
    }
  };

  // 控制全选框的显示状态
  const isAllRelevantSelected = activeDockStatuses.length > 0
    ? dockedRowKeys.length > 0 && dockedRowKeys.every(key => selectedKeys.includes(key))
    : data.length > 0 && selectedKeys.length === data.length;

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedKeys(prev => [...prev, id]);
    } else {
      setSelectedKeys(prev => prev.filter(key => key !== id));
    }
  };

  // 状态切换处理
  const toggleDockStatus = (status: 'out' | 'low') => {
    setActiveDockStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const columns: GridColumn<InventoryViewRecord>[] = [
    {
      key: '_checkbox',
      title: '',
      width: '50px',
      align: 'center',
      fixed: 'left',
      render: (record) => (
        <input 
          type="checkbox" 
          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
          checked={selectedKeys.includes(record.id)}
          onChange={(e) => handleSelectRow(record.id, e.target.checked)}
        />
      )
    },
    { 
      key: 'code', title: 'Item Code', width: '130px', align: 'left', fixed: 'left',
      render: (record) => <span className="font-bold text-gray-700">{record.code}</span>
    },
    { key: 'name', title: 'Item Name', width: '200px', align: 'left' },
    { 
      key: 'category', title: 'Category', width: '120px',
      render: (record) => (
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
          {record.category}
        </span>
      )
    },
    { 
      key: 'qty', title: 'Qty / Safety', width: '140px', align: 'right',
      render: (record) => (
        <div className="flex justify-end items-center space-x-2 font-tabular">
          <span className={`font-bold ${record.qty === 0 ? 'text-red-500' : record.qty < record.safetyStock ? 'text-orange-500' : 'text-gray-900'}`}>
            {record.qty}
          </span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 text-xs">{record.safetyStock}</span>
        </div>
      )
    },
    { 
      key: 'status', title: 'Health Status', width: '130px',
      render: (record) => {
        const statusConfig = {
          healthy: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Healthy' },
          low: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Low Stock' },
          out: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Out of Stock' },
        }[record.status];

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
            {statusConfig.label}
          </span>
        );
      }
    },
    {
      key: 'action', title: 'Action', width: '100px', fixed: 'right',
      render: (record) => (
        <button 
          onClick={() => handleCopyCode(record.code, record.id)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
            copiedId === record.id 
              ? 'bg-green-100 text-green-700' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
          }`}
        >
          {copiedId === record.id ? 'Copied!' : 'Copy Code'}
        </button>
      )
    }
  ];

  const hasSelection = selectedKeys.length > 0;
  const selectedRecords = data.filter(d => selectedKeys.includes(d.id));

  // 状态样式计算
  const isOutDocked = activeDockStatuses.includes('out');
  const isLowDocked = activeDockStatuses.includes('low');

  return (
    <div className="bg-white shadow-xl flex flex-col h-[600px] rounded-lg overflow-hidden border border-neutral-divider text-left relative">
      
      <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-divider bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-neutral-title">Inventory Health Dashboard</h2>
          <p className="text-xs text-neutral-muted mt-1">Configurable downstream actions with selection state.</p>
        </div>
        <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer bg-white px-3 py-1.5 border border-gray-200 rounded shadow-sm hover:bg-gray-50">
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            checked={isAllRelevantSelected}
            onChange={handleSelectAll}
          />
          <span className="font-medium">Select All {activeDockStatuses.length > 0 ? 'Docked' : ''}</span>
        </label>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden p-6" ref={gridContainerRef}>
        <BaseGridEngine
          data={data}
          columns={columns}
          rowKey="id"
          dockedRowKeys={dockedRowKeys} 
          features={{ showCrosshair: true, enableDock: true, enableKeyboardNav: true }}
        />
      </div>

      <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-divider bg-gray-50 transition-all duration-300">
        
        <div className={`flex items-center space-x-4 transition-opacity ${hasSelection ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <span className="text-sm text-gray-500 font-medium">Total {data.length} items</span>
          
          <button
            onClick={() => toggleDockStatus('out')}
            className={`flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all shadow-sm ${isOutDocked ? 'border-red-500 bg-red-500 text-white' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOutDocked ? 'bg-white' : 'bg-red-500'}`}></span>
            <span>{outCount} Out of Stock</span>
          </button>
          
          <button
            onClick={() => toggleDockStatus('low')}
            className={`flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all shadow-sm ${isLowDocked ? 'border-orange-500 bg-orange-500 text-white' : 'border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLowDocked ? 'bg-white' : 'bg-orange-500'}`}></span>
            <span>{lowCount} Low Stock</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {hasSelection && <span className="text-sm font-bold text-primary-600 mr-2">{selectedKeys.length} selected</span>}
          
          {configuredActions.map(action => (
            <button
              key={action.key}
              disabled={!hasSelection}
              onClick={() => action.onClick(selectedRecords)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all shadow-sm
                ${!hasSelection 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : action.isPrimary 
                    ? 'bg-gray-900 text-white hover:bg-gray-800 transform hover:-translate-y-0.5' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {action.label} {hasSelection && action.isPrimary ? `(${selectedKeys.length})` : ''}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
};