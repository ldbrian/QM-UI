// src/core/theme.ts

export const gridTheme = {
  // 1. 最外层容器 (坚固的底盘)
  container: 'bg-white shadow-xl flex flex-col h-[600px] rounded-lg border border-gray-200 text-left relative font-sans outline-none focus:ring-1 focus:ring-gray-300 overflow-hidden',
  
  // 2. 内部滚动轴 (强制表头和表体在同一坐标系)
  scrollWrapper: 'flex-1 overflow-auto bg-white relative',
  
  // 3. 虚拟 Table 画布 (给予最小宽度，防止挤压)
  tableWrapper: 'min-w-[800px] w-full flex flex-col',
  
  // 4. 表头 (硬朗、固定)
  headerWrapper: 'sticky top-0 z-20 flex bg-gray-100 border-b-2 border-gray-300 font-bold text-gray-700 text-sm select-none shadow-sm',
  headerCell: 'px-4 py-3 border-r border-gray-300 last:border-r-0 flex items-center',
  
  // 5. 表体与行
  bodyWrapper: 'divide-y divide-gray-200 flex flex-col',
  rowNormal: 'flex items-stretch transition-colors bg-white hover:bg-blue-50/40',
  rowDragging: 'opacity-40 bg-gray-100 shadow-inner',
  rowDropTargetInside: 'bg-blue-100 ring-2 ring-inset ring-blue-400',
  
  // 6. 单元格 (文字截断、垂直居中)
  cellNormal: 'px-4 py-3 border-r border-gray-200 last:border-r-0 relative flex items-center min-w-0 text-sm text-gray-800',
  cellActive: 'ring-2 ring-inset ring-primary-500 bg-primary-50 z-10',
  
  // 7. 拖拽指示线
  dropIndicatorBefore: 'inset 0 3px 0 0 #3b82f6',
  dropIndicatorAfter: 'inset 0 -3px 0 0 #3b82f6',
};