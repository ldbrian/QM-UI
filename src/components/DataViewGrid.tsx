/**
 * @file QM-UI Component
 * @version 2.0.0 (V2 Engine Adapted)
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { BaseGridEngine, type GridColumn } from '../core/BaseGridEngine';

interface InventoryViewRecord {
  id: string; code: string; name: string; category: string;
  bin: string; qty: number; safetyStock: number; status: 'healthy' | 'low' | 'out';
}

export const DataViewGrid = () => {
  const [data] = useState<InventoryViewRecord[]>([
    { id: 'R001', code: 'B08F6B9GD1', name: 'Anker 10000mAh Power Bank', category: 'Electronics', bin: 'A-12-01', qty: 120, safetyStock: 50, status: 'healthy' },
    { id: 'R002', code: 'B09J8P9A3D', name: 'Logitech MX Master 3S', category: 'Accessories', bin: 'A-12-02', qty: 8, safetyStock: 50, status: 'low' },
    { id: 'R003', code: 'B07WNV5D6C', name: 'Apple AirPods Pro (2nd Gen)', category: 'Audio', bin: 'B-04-15', qty: 0, safetyStock: 20, status: 'out' },
    { id: 'R004', code: 'B08N5M7S6Z', name: 'iPhone 15 Pro Case', category: 'Accessories', bin: 'B-04-16', qty: 0, safetyStock: 15, status: 'out' },
    { id: 'R005', code: 'B01N5M7X8L', name: 'Ugreen USB-C Hub 6-in-1', category: 'Accessories', bin: 'C-01-99', qty: 300, safetyStock: 100, status: 'healthy' },
  ]);

  const [activeDockStatuses, setActiveDockStatuses] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const outCount = data.filter(d => d.status === 'out').length;
  const lowCount = data.filter(d => d.status === 'low').length;

  // 🔥 V2 架构：根据业务状态，将匹配的数据排到数组最后（模拟吸底）
  const displayData = useMemo(() => {
    if (activeDockStatuses.length === 0) return data;
    const normalRows = data.filter(d => !activeDockStatuses.includes(d.status));
    const dockedRows = data.filter(d => activeDockStatuses.includes(d.status));
    return [...normalRows, ...dockedRows];
  }, [data, activeDockStatuses]);

  useEffect(() => {
    if (activeDockStatuses.length > 0) {
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

  const columns: GridColumn<InventoryViewRecord>[] = [
    {
      key: '_checkbox', title: 'Sel', width: '60px', align: 'center',
      render: (_record, ctx) => (
        <input 
          type="checkbox" 
          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
          checked={ctx.isSelected}
          onChange={() => ctx.toggleSelect()}
        />
      )
    },
    { 
      key: 'code', title: 'Item Code', width: '130px', align: 'left',
      render: (record) => <span className="font-bold text-gray-800">{record.code}</span>
    },
    { key: 'name', title: 'Item Name', width: 'auto', align: 'left', render: (r) => <span className="truncate">{r.name}</span> },
    { 
      key: 'category', title: 'Category', width: '120px', align: 'left',
      render: (r) => <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">{r.category}</span>
    },
    { 
      key: 'qty', title: 'Qty / Safety', width: '140px', align: 'right',
      render: (record) => (
        <div className="font-tabular-nums">
          <span className={`font-bold ${record.qty === 0 ? 'text-red-500' : record.qty < record.safetyStock ? 'text-orange-500' : 'text-gray-900'}`}>{record.qty}</span>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-gray-500 text-xs">{record.safetyStock}</span>
        </div>
      )
    },
    { 
      key: 'status', title: 'Status', width: '120px', align: 'center',
      render: (record) => {
        const config = {
          healthy: 'bg-green-50 text-green-700 border-green-200',
          low: 'bg-orange-50 text-orange-700 border-orange-200',
          out: 'bg-red-50 text-red-700 border-red-200',
        }[record.status];
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config}`}>{record.status.toUpperCase()}</span>;
      }
    },
    {
      key: 'action', title: 'Action', width: '110px', align: 'center',
      render: (record) => (
        <button 
          onClick={(e) => { e.stopPropagation(); handleCopyCode(record.code, record.id); }}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${copiedId === record.id ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
        >
          {copiedId === record.id ? 'Copied!' : 'Copy'}
        </button>
      )
    }
  ];

  const toggleDockStatus = (status: 'out' | 'low') => {
    setActiveDockStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const hasSelection = selectedKeys.length > 0;
  const isOutDocked = activeDockStatuses.includes('out');
  const isLowDocked = activeDockStatuses.includes('low');

  return (
    <div className="bg-white shadow-xl flex flex-col h-[600px] rounded-lg overflow-hidden border border-gray-200 text-left relative font-sans">
      
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Inventory Health Dashboard</h2>
          <p className="text-xs text-gray-500 mt-1">Configurable downstream actions with selection state.</p>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" ref={gridContainerRef}>
        <BaseGridEngine
          mode="action"
          data={displayData}
          columns={columns}
          rowKey="id"
          onRowSelect={setSelectedKeys}
        />
      </div>

      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0 transition-all duration-300">
        <div className={`flex items-center space-x-4 transition-opacity ${hasSelection ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <span className="text-sm text-gray-500 font-medium">Total {data.length} items</span>
          <button onClick={() => toggleDockStatus('out')} className={`flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all shadow-sm ${isOutDocked ? 'border-red-500 bg-red-500 text-white' : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOutDocked ? 'bg-white' : 'bg-red-500'}`}></span>
            <span>{outCount} Out of Stock</span>
          </button>
          <button onClick={() => toggleDockStatus('low')} className={`flex items-center space-x-1.5 px-3 py-1 border rounded-full text-xs font-bold transition-all shadow-sm ${isLowDocked ? 'border-orange-500 bg-orange-500 text-white' : 'border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLowDocked ? 'bg-white' : 'bg-orange-500'}`}></span>
            <span>{lowCount} Low Stock</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {hasSelection && <span className="text-sm font-bold text-primary-600 mr-2">{selectedKeys.length} selected</span>}
          <button disabled={!hasSelection} className={`px-4 py-2 rounded text-sm font-medium transition-all shadow-sm ${!hasSelection ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            Export List
          </button>
          <button disabled={!hasSelection} className={`px-4 py-2 rounded text-sm font-medium transition-all shadow-sm ${!hasSelection ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 transform hover:-translate-y-0.5'}`}>
            Create Purchase Order
          </button>
        </div>
      </div>
      
    </div>
  );
};