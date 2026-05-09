import React, { useState, useEffect, useRef } from 'react';
import { BaseGridEngine, type GridColumn, type CellContext } from '../core/BaseGridEngine';
import type { RawTreeNode } from '../core/treeEngine';

// ==========================================
// 1. 辅助组件：支持半选状态的 Checkbox
// ==========================================
const IndeterminateCheckbox = ({ 
  checked, 
  indeterminate, 
  onChange 
}: { 
  checked: boolean; 
  indeterminate?: boolean; 
  onChange: () => void; 
}) => {
  const ref = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <input 
      ref={ref}
      type="checkbox" 
      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
      checked={checked}
      onChange={onChange}
    />
  );
};

// ==========================================
// 2. 业务数据配置 (BOM 数据)
// ==========================================
const initialBOM: RawTreeNode[] = [
  {
    id: 'ASSY-001', name: 'V8 Engine Assembly', sku: 'ENG-V8-9000', qty: 1, price: 12500, status: 'WIP', children: [
      { id: 'BLK-001', name: 'Aluminum Cylinder Block', sku: 'PART-BLK-01', qty: 1, price: 3200, status: 'Healthy' },
      { id: 'PST-001', name: 'Forged Piston Kit', sku: 'PART-PST-08', qty: 8, price: 150, status: 'Low Stock', children: [
        { id: 'PST-R-1', name: 'Piston Ring (Compression)', sku: 'RNG-C-16', qty: 16, price: 12, status: 'Healthy' },
        { id: 'PST-R-2', name: 'Piston Ring (Oil Control)', sku: 'RNG-O-08', qty: 8, price: 15, status: 'Healthy' }
      ]},
      { id: 'VLV-001', name: 'Titanium Alloy Valve', sku: 'PART-VLV-32', qty: 32, price: 45, status: 'Purchasing' }
    ]
  },
  {
    id: 'ASSY-002', name: 'Chassis Suspension System', sku: 'CHS-SYS-400', qty: 1, price: 4800, status: 'Ready', children: [
      { id: 'SHK-001', name: 'Electromagnetic Shock Absorber', sku: 'PART-SHK-04', qty: 4, price: 450, status: 'Healthy' },
      { id: 'BRK-001', name: 'Carbon Ceramic Brake Disc', sku: 'PART-BRK-04', qty: 4, price: 850, status: 'Shortage' },
      { id: 'CLP-001', name: '6-Piston Brake Caliper', sku: 'PART-CLP-04', qty: 4, price: 600, status: 'Healthy' }
    ]
  },
  { id: 'ASSY-003', name: 'Body Wiring Harness', sku: 'WIR-MAIN-01', qty: 1, price: 850, status: 'Healthy' }
];

export const TreeGridDemo = () => {
  const [treeData, setTreeData] = useState<RawTreeNode[]>(initialBOM);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  // ==========================================
  // 3. 纯粹的业务逻辑：处理树节点的拖拽重组
  // ==========================================
  const handleTreeDrop = (draggedId: string, targetId: string, position: 'before' | 'inside' | 'after') => {
    const newData = JSON.parse(JSON.stringify(treeData)) as RawTreeNode[];
    let draggedNode: RawTreeNode | null = null;

    // 1. 拔出被拖拽的节点
    const extractNode = (nodes: RawTreeNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (String(nodes[i].id) === draggedId) {
          draggedNode = nodes.splice(i, 1)[0];
          return true;
        }
        if (nodes[i].children && extractNode(nodes[i].children as RawTreeNode[])) return true;
      }
      return false;
    };
    extractNode(newData);

    if (!draggedNode) return;

    // 2. 防死循环校验：目标节点不能是拖拽节点的子孙
    const isTargetInside = (nodes: RawTreeNode[]): boolean => {
      return nodes.some(n => String(n.id) === targetId || (n.children && isTargetInside(n.children as RawTreeNode[])));
    };
    if (isTargetInside([draggedNode])) {
      console.warn("Drag Failed: Cannot drop a parent node into its own descendants.");
      return;
    }

    // 3. 插入节点
    const insertNode = (nodes: RawTreeNode[]): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (String(nodes[i].id) === targetId) {
          if (position === 'inside') {
            nodes[i].children = nodes[i].children || [];
            (nodes[i].children as RawTreeNode[]).unshift(draggedNode!);
          } else if (position === 'before') {
            nodes.splice(i, 0, draggedNode!);
          } else if (position === 'after') {
            nodes.splice(i + 1, 0, draggedNode!);
          }
          return true;
        }
        if (nodes[i].children && insertNode(nodes[i].children as RawTreeNode[])) return true;
      }
      return false;
    };
    insertNode(newData);
    setTreeData(newData);
  };

  // ==========================================
  // 4. 列配置（适配 V2 引擎的 CellContext，并加入半选支持）
  // ==========================================
  const columns: GridColumn<any>[] = [
    {
      key: '_checkbox',
      title: 'Sel',
      width: '50px',
      align: 'center',
      render: (record: any, ctx: CellContext) => (
        <IndeterminateCheckbox 
          checked={ctx.isSelected}
          indeterminate={ctx.isIndeterminate} // FSM 引擎自动计算的半选状态
          onChange={() => ctx.toggleSelect()}
        />
      )
    },
    { 
      key: 'name', 
      title: 'Material Name (Space to toggle)', 
      width: 'auto', 
      align: 'left',
      render: (record: any, ctx: CellContext) => (
        <div className="flex items-center" style={{ paddingLeft: `calc(4px + 24px * ${record._depth || 0})` }}>
          <div 
            className="w-6 h-6 flex items-center justify-center mr-2 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-200 shrink-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); ctx.toggleExpand(); }}
          >
            {record._hasChildren ? (
              <svg className={`w-4 h-4 transform transition-transform ${record._isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full inline-block"></span>
            )}
          </div>
          <span className={`truncate text-sm ${record._depth === 0 ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
            {record.name}
          </span>
        </div>
      )
    },
    { 
      key: 'sku', 
      title: 'SKU Code', 
      width: '20%', 
      align: 'left', 
      render: (r: any) => <span className="font-bold text-gray-700">{r.sku}</span> 
    },
    { 
      key: 'qty', 
      title: 'Qty', 
      width: '100px', 
      align: 'right', 
      render: (r: any) => <span className="font-tabular-nums">{r.qty}</span> 
    },
    { 
      key: 'price', 
      title: 'Unit Price', 
      width: '120px', 
      align: 'right', 
      render: (r: any) => <span className="font-tabular-nums text-gray-500">${Number(r.price).toLocaleString()}</span> 
    },
    { 
      key: 'status', 
      title: 'Status', 
      width: '120px', 
      align: 'center', 
      render: (r: any) => {
        const statusConfig: Record<string, string> = {
          'Healthy': 'bg-green-50 text-green-700 border-green-200',
          'Ready': 'bg-green-50 text-green-700 border-green-200',
          'WIP': 'bg-blue-50 text-blue-700 border-blue-200',
          'Purchasing': 'bg-blue-50 text-blue-700 border-blue-200',
          'Low Stock': 'bg-orange-50 text-orange-700 border-orange-200',
          'Shortage': 'bg-red-50 text-red-700 border-red-200',
        };
        const classes = statusConfig[r.status] || 'bg-gray-50 text-gray-700 border-gray-200';
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${classes} whitespace-nowrap`}>{r.status}</span>;
      }
    }
  ];

  return (
    <div className="bg-white shadow-xl flex flex-col h-[600px] rounded-lg overflow-hidden border border-gray-200 text-left relative font-sans">
      
      {/* 头部面板 */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">BOM Tree (Powered by V2 Engine)</h2>
          <p className="text-xs text-gray-500 mt-1">100% Logic Decoupled. Rendered by GridRenderEngine.</p>
        </div>
      </div>

      {/* 核心引擎挂载区 */}
      <div className="flex-1 overflow-hidden relative">
        <BaseGridEngine 
          mode="tree"
          data={treeData}
          columns={columns}
          rowKey="id"
          onRowSelect={setSelectedKeys}
          onTreeDrop={handleTreeDrop}
        />
      </div>

      {/* 底部面板 */}
      <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
        <div className="text-sm text-gray-500 font-medium">Total {treeData.length} root assemblies</div>
        <div className="flex items-center space-x-3">
          {selectedKeys.length > 0 && <span className="text-sm font-bold text-gray-900 mr-2">{selectedKeys.length} items selected</span>}
          <button 
            disabled={selectedKeys.length === 0} 
            className={`px-4 py-2 rounded text-sm font-medium transition-all shadow-sm ${selectedKeys.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 transform hover:-translate-y-0.5'}`}
          >
            Create Sub-BOM
          </button>
        </div>
      </div>
      
    </div>
  );
};