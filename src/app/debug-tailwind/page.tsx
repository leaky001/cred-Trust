"use client";

export default function DebugTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-surface-secondary p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-display font-bold text-primary-600 mb-4">Tailwind Debug Page</h1>
        <p className="text-body mb-6">If Tailwind is working you should see colored boxes and styled text below.</p>

        <div className="space-y-4">
          <div className="p-6 rounded-lg shadow-elevation-2 bg-primary-600 text-white">primary-600 / white text</div>
          <div className="p-6 rounded-lg shadow-elevation-2 bg-accent-500 text-white">accent-500 / white text</div>
          <div className="p-6 rounded-lg shadow-elevation-2 bg-surface-secondary text-gray-700">surface-secondary / gray text</div>
          <div className="p-6 rounded-lg border border-gray-200">border-gray-200</div>
          <div className="p-6 rounded-lg bg-white text-h4">text-h4 (custom font size)</div>
        </div>

        <div className="mt-8">
          <h2 className="text-h3 mb-2">Utility checks</h2>
          <div className="flex gap-4 flex-wrap">
            <span className="px-3 py-1 rounded bg-green-500 text-white">bg-green-500</span>
            <span className="px-3 py-1 rounded bg-red-500 text-white">bg-red-500</span>
            <span className="px-3 py-1 rounded bg-yellow-400 text-black">bg-yellow-400</span>
            <span className="px-3 py-1 rounded bg-blue-500 text-white">bg-blue-500</span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-h4 mb-2">Font & spacing</h3>
          <p className="text-body-lg mb-2">This paragraph should use the projects configured font and sizes.</p>
          <div className="border p-4">padding should apply (p-4)</div>
        </div>
      </div>
    </div>
  );
}
