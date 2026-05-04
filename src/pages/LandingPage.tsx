// src/pages/LandingPage.tsx
import { DataEntryGrid } from '../components/DataEntryGrid';
import { DataViewGrid } from '../components/DataViewGrid'; // 🔥 引入查询表
import { useState } from 'react'; // 引入 useState
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'view'>('entry'); // 🔥 控制显示哪张表
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-neutral-800">
      
      {/* === 1. Navigation === */}
      <nav className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto">
        <div className="font-bold text-2xl tracking-tighter text-gray-900">
          QM-UI<span className="text-primary-500">.</span>
        </div>
        <div className="space-x-6 text-sm font-medium text-gray-600 hidden md:block">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#comparison" className="hover:text-gray-900">Why not AG Grid?</a>
          <a href="#pricing" className="hover:text-gray-900">Early Bird</a>
        </div>
      </nav>

      {/* === 2. Hero Section === */}
      <section className="pt-16 pb-24 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-bold tracking-wide">
          V1.0 High-Speed Entry Grid is Ready
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Stop letting clunky open-source tables <br />ruin your B2B delivery.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto">
          A React table component built strictly for high-frequency data entry and internal tools. Featuring true 2D keyboard navigation, barcode scanner loops, and an anti-error Dock system. Not a bloated Swiss Army knife—a drop-in V8 engine.
        </p>
        <div className="flex justify-center space-x-4 flex-col sm:flex-row gap-4 sm:gap-0">
          <a href="#pricing" className="bg-gray-900 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg transform hover:-translate-y-0.5">
            Get Founding Member License - $39.00
          </a>
          <a href="#demo" className="bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-lg font-bold hover:bg-gray-50 transition-colors">
            Try Live Demo ↓
          </a>
        </div>
      </section>

      {/* === 3. Live Demo === */}
      <section id="demo" className="max-w-6xl mx-auto px-4 pb-24">

        {/* 🔥 极简主义的 Tab 切换栏 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('entry')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'entry' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              1. Data Entry Flow
            </button>
            <button 
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              2. Data View & Filtering
            </button>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100 relative">
          {/* Live Component */}
          {activeTab === 'entry' ? <DataEntryGrid /> : <DataViewGrid />}
        </div>
      </section>

      {/* === 4. The No-BS Comparison === */}
      <section id="comparison" className="bg-gray-900 py-24 px-4 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Why not just use the free AG Grid?</h2>
          <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="p-6 text-gray-400 font-medium w-1/3">Pain Points</th>
                  <th className="p-6 text-gray-400 font-medium border-l border-gray-700 w-1/3">AG Grid (Free Community)</th>
                  <th className="p-6 text-primary-400 font-bold border-l border-gray-700 w-1/3">QM-UI (Available Today)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="p-6 font-medium">True Keyboard-First Nav</td>
                  <td className="p-6 text-gray-400 border-l border-gray-700">❌ Needs heavy custom interceptors</td>
                  <td className="p-6 text-white border-l border-gray-700">✅ Built-in 2D engine, out of the box</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Barcode Scanner Loop</td>
                  <td className="p-6 text-gray-400 border-l border-gray-700">❌ No business context, build it yourself</td>
                  <td className="p-6 text-white border-l border-gray-700">✅ Flawless loop: Mounts & Auto-selects</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Error Isolation Dock</td>
                  <td className="p-6 text-gray-400 border-l border-gray-700">❌ Errors get lost in thousands of rows</td>
                  <td className="p-6 text-white border-l border-gray-700">✅ State-machine driven, 1-click dock to bottom</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Pricing Model</td>
                  <td className="p-6 text-gray-400 border-l border-gray-700">Free (But costs you days to glue business logic)</td>
                  <td className="p-6 text-primary-400 font-bold border-l border-gray-700">$39.00 (Saves you 3 days of dev time)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-gray-400 mt-8 text-sm">
            <strong>Real talk:</strong> If you need insanely complex pivot tables or charting, go use the magnificent AG Grid.<br/>
            But if you want to ship a buttery-smooth "high-frequency data entry" experience to your client in 1 minute, buying us is a no-brainer.
          </p>
        </div>
      </section>

      {/* === 5. Roadmap / Future Arsenal === */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Join as a Founding Member. Unlock Future UI Weapons.</h2>
        <p className="text-center text-gray-500 mb-12">Buy the "Data Entry Grid" today, and get a permanent 50% insider discount on all future complex components.</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 flex flex-col items-center text-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Infinite Tree-BOM Grid</h3>
            <p className="text-sm text-gray-500 mb-4">Designed for Bill of Materials and Org Charts. Supports cross-level drag & drop and lazy loading.</p>
            <button className="text-primary-600 font-bold text-sm bg-primary-50 px-4 py-2 rounded">Vote to Accelerate</button>
          </div>
          <div className="border border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 flex flex-col items-center text-center opacity-70 hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Dense Filter Grid</h3>
            <p className="text-sm text-gray-500 mb-4">Handle massive data cleaning and multi-condition queries with memoized layouts.</p>
            <button className="text-primary-600 font-bold text-sm bg-primary-50 px-4 py-2 rounded">Vote to Accelerate</button>
          </div>
        </div>
      </section>

      {/* === 6. Pricing (The Hook) === */}
      <section id="pricing" className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-900">Pay Once. Ship Faster.</h2>
          <p className="text-xl text-gray-500 mb-10">Ship fewer bugs, sleep more soundly.</p>
          
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-bl-lg">
              Early Bird (First 100 spots only)
            </div>
            <div className="text-left mb-8">
              <h3 className="text-2xl font-bold mb-2">Founding Member License</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">$39.00</span>
                <span className="text-gray-400 line-through text-xl">$99.00</span>
              </div>
            </div>
            
            <ul className="text-left space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <span className="text-primary-400">✔</span> Permanent access to V1.0 Data Entry Grid React source code
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary-400">✔</span> Includes BaseGridEngine + Tailwind Design System assets
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary-400">✔</span> Unlimited commercial use for your client/agency projects
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary-400">✔</span> <strong>Bonus:</strong> Lock in a 50% discount on all future complex components
              </li>
            </ul>

            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-[0_0_20px_rgba(22,119,255,0.4)]">
              Pay Now & Lock Early Bird Access
            </button>
            <p className="text-gray-400 text-xs mt-4 text-center">Secure payment by Stripe. By purchasing, you agree to the License Agreement.</p>
          </div>
        </div>
      </section>

      {/* === Footer === */}
      {/* 在 LandingPage.tsx 的底部区域添加 */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-24">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="text-gray-500 mb-4 md:mb-0">
            &copy; 2026 QM-UI. Built for high-frequency data entry.
          </div>
          <div className="flex space-x-6">
            {/* 使用 Link 组件实现前端无刷新跳转 */}
            <Link to="/license" className="text-gray-500 hover:text-gray-900 transition-colors">
              License & Terms
            </Link>
            <a href="mailto:your-email@example.com" className="text-gray-500 hover:text-gray-900 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};