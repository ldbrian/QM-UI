// src/pages/LandingPage.tsx
import { DataEntryGrid } from '../components/DataEntryGrid';
import { DataViewGrid } from '../components/DataViewGrid'; 
import { TreeGridDemo } from '../components/TreeGridDemo';
import { useState } from 'react'; 
import { Link } from 'react-router-dom';

export const LandingPage = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'view' | 'tree'>('entry'); 
  
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
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
        </div>
      </nav>

      {/* === 2. Hero Section === */}
      <section className="pt-16 pb-24 px-4 text-center max-w-5xl mx-auto">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-xs font-bold tracking-wide">
          V2.0 Engine Released: FSM Architecture + Drag & Drop 🚀
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Stop letting clunky open-source tables <br />ruin your B2B delivery.
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto">
          A React table framework built strictly for high-frequency data entry and complex ERP systems. Featuring true 2D keyboard navigation, barcode scanner loops, and an infinite BOM tree engine.
          <br/><strong className="text-gray-700 mt-2 block">Not a bloated Swiss Army knife—a drop-in V8 engine.</strong>
        </p>
        <div className="flex justify-center space-x-4 flex-col sm:flex-row gap-4 sm:gap-0">
          <a href="#pricing" className="bg-gray-900 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-gray-800 transition-colors shadow-lg transform hover:-translate-y-0.5">
            Get Pro License - $149.00
          </a>
          <a href="#demo" className="bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-lg font-bold hover:bg-gray-50 transition-colors">
            Try Live Demo ↓
          </a>
        </div>
      </section>

      {/* === 3. Live Demo === */}
      <section id="demo" className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 overflow-x-auto max-w-full">
            <button 
              onClick={() => setActiveTab('entry')}
              className={`px-6 py-2 whitespace-nowrap rounded-md text-sm font-bold transition-all ${activeTab === 'entry' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              1. Data Entry Flow
            </button>
            <button 
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 whitespace-nowrap rounded-md text-sm font-bold transition-all ${activeTab === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              2. Data View & Filtering
            </button>
            <button 
              onClick={() => setActiveTab('tree')}
              className={`px-6 py-2 whitespace-nowrap rounded-md text-sm font-bold transition-all ${activeTab === 'tree' ? 'bg-white text-gray-900 shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              3. BOM Tree Grid (Pro)
            </button>
          </div>
        </div>

        {/* 渲染区域 */}
        <div className="relative">
          {activeTab === 'entry' && <DataEntryGrid />}
          {activeTab === 'view' && <DataViewGrid />}
          {activeTab === 'tree' && <TreeGridDemo />}
        </div>
      </section>

      {/* === 4. Pricing Section (The Hook & The Cash Cow) === */}
      <section id="pricing" className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">Pay Once. Ship Faster.</h2>
            <p className="text-xl text-gray-500">Save weeks of development time building complex B2B tables.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Standard License ($39) */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col hover:shadow-xl transition-shadow bg-white">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Standard License</h3>
              <p className="text-gray-500 text-sm mb-6 h-10">Perfect for indie devs and internal tooling MVPs.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-extrabold text-gray-900">$39</span>
                <span className="text-gray-500">/ forever</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">✔</span> 
                  <span><strong>BaseGridEngine V2</strong> source code</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">✔</span> 
                  <span><strong>Data Entry Preset:</strong> 2D keyboard nav, Scanner Loop, Error Dock</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">✔</span> 
                  <span><strong>Data View Preset:</strong> Conditional rendering & state management</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">✔</span> 
                  <span>Unlimited commercial projects</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400 line-through">
                  <span>❌ BOM Tree Grid Preset (Drag & Drop)</span>
                </li>
              </ul>

              <a 
                href="https://YOUR_LEMON_SQUEEZY_LINK_BASIC"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-xl transition-colors"
              >
                Get Standard
              </a>
            </div>

            {/* Enterprise / Pro License ($149) */}
            <div className="border-2 border-gray-900 rounded-2xl p-8 flex flex-col shadow-2xl relative bg-gray-900 text-white transform md:-translate-y-4">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Best for ERP / PLM
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro Suite</h3>
              <p className="text-gray-400 text-sm mb-6 h-10">The ultimate weapon for enterprise teams and complex manufacturing systems.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-extrabold">$149</span>
                <span className="text-gray-400">/ forever</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-primary-400 font-bold">✔</span> 
                  <span>Everything in Standard License</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-primary-400 font-bold">✔</span> 
                  <span><strong>Infinite BOM Tree Grid Preset:</strong> Fully decoupled UI</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-primary-400 font-bold">✔</span> 
                  <span><strong>D&D Engine:</strong> Cross-level drag & drop with anti-cycle logic</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-primary-400 font-bold">✔</span> 
                  <span><strong>FSM Selection:</strong> Indeterminate checkbox states out-of-the-box</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-primary-400 font-bold">✔</span> 
                  <span>Priority email support</span>
                </li>
              </ul>

              <a 
                href="https://YOUR_LEMON_SQUEEZY_LINK_PRO"
                className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-[0_0_20px_rgba(22,119,255,0.3)]"
              >
                Get Pro Suite
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="text-gray-500 mb-4 md:mb-0">
            &copy; 2026 QM-UI. Built for high-frequency data entry.
          </div>
          <div className="flex space-x-6">
            <Link to="/license" className="text-gray-500 hover:text-gray-900 transition-colors">
              License & Terms
            </Link>
            <a href="mailto:ldbrian2262@gmail.com" className="text-gray-500 hover:text-gray-900 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};