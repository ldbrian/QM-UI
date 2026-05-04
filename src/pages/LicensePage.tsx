import React from 'react';

export const LicensePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 shadow-sm border border-neutral-divider rounded-lg">
        
        <div className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">QM-UI Commercial License</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: May 2026</p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed text-sm">
          
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Grant of License</h2>
            <p>
              By purchasing the QM-UI source code, you are granted a non-exclusive, non-transferable right to use the code. 
              This is a <strong>Single Developer License</strong>. It grants one (1) designated developer the right to use the QM-UI source code in unlimited end products (including commercial client projects, internal enterprise tools, and SaaS applications).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Permitted Usage</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You <strong>may</strong> use the code to build unlimited projects for yourself or your clients.</li>
              <li>You <strong>may</strong> modify, alter, or adapt the source code to fit your specific business logic and design needs.</li>
              <li>You <strong>may</strong> charge your clients for the end product (e.g., an ERP system) that incorporates this code.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Restrictions</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You <strong>may not</strong> redistribute, resell, lease, or license the source code itself.</li>
              <li>You <strong>may not</strong> use the code to create a competing product, such as an open-source React grid library, a UI template, or a component library intended for developers.</li>
              <li>You <strong>may not</strong> publish the source code in a public repository (e.g., public GitHub repo).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Refunds & Return Policy (All Sales Final)</h2>
            <p>
              Due to the non-returnable nature of digital source code, <strong>all sales are final and non-refundable</strong>. 
              We provide a comprehensive Live Demo for you to test the functionality, keyboard navigation, and UI thoroughly before making a purchase decision. By purchasing, you agree to waive any right to a refund.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Warranty & Support</h2>
            <p>
              The code is provided "as is", without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from the use of the software. Support is limited to bug reports and feature requests via our official channels, but we do not guarantee an SLA (Service Level Agreement) for response times.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <button 
            onClick={() => window.history.back()} 
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            &larr; Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};