# QM-UI V1.0 - High-Speed B2B Grid Components

Welcome to QM-UI, the React grid system engineered specifically for high-frequency data entry and complex B2B workflows (WMS, ERP, SaaS).

This package contains the raw, customizable source code. It is not an npm package; you own the code and can modify it to fit your exact business logic.

## 📦 What's Included

*   `src/core/BaseGridEngine.tsx` - The underlying coordinate and docking engine.
*   `src/components/DataEntryGrid.tsx` - The high-speed, 2D-keyboard navigation entry template.
*   `src/components/DataViewGrid.tsx` - The inventory dashboard template with selection and status docking.
*   `tailwind.config.js` - Essential color palette and spacing configurations.

## 🛠️ Prerequisites

Ensure your React project has the following installed:
1.  **React 18+**
2.  **Tailwind CSS** (for styling)
3.  **Lucide React** (Optional, if you use our default icons)
    ```bash
    npm install lucide-react
    ```

## 🚀 Quick Integration Guide

**Step 1: Copy the Source Code**
Copy the `core` and `components` folders from this package into your project's `src` directory (e.g., `src/qm-ui/core`, `src/qm-ui/components`).

**Step 2: Merge Tailwind Configuration**
Open our provided `tailwind.config.js` and merge the `theme.extend.colors` (like primary, neutral, danger) into your project's existing `tailwind.config.js` or `tailwind.config.ts`. Without this, the grid will lack proper styling.

**Step 3: Import and Render**
Import the templates directly into your views:

```tsx
import { DataEntryGrid } from './qm-ui/components/DataEntryGrid';
import { DataViewGrid } from './qm-ui/components/DataViewGrid';

function App() {
  return (
    <div className="p-8">
      
      <DataEntryGrid/>
      
      
      <DataViewGrid/>
    </div>
  );
}

export default App;
```

## ⚖️ License & Terms

This source code is provided under the **QM-UI Single Developer Commercial License**.

*   **You MAY:** Use this code in unlimited commercial end-products for yourself or your clients. Modify the code as needed.
*   **You MAY NOT:** Redistribute, resell, or publish this source code publicly (e.g., as part of an open-source library, a paid UI kit, or a public GitHub repository).

All sales are final. For full license details, please refer to the `LICENSE.md` file included in this package or visit our official website.

## 💬 Support

If you encounter any critical bugs within the core engine, please contact us at: ldbrian2262@gmail.com