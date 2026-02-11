'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/app/components/Header';
import StatsDashboard from '@/app/components/StatsDashboard';
import BlockDetailPanel from '@/app/components/BlockDetailPanel';
import { useBlockchain } from '@/app/context/BlockchainContext';
import { Button } from '@/components/ui/button';
import { RotateCcw, Infinity as InfinityIcon, Loader2, MousePointerClick } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import for Three.js scene (no SSR — WebGL is client-only)
const BlockchainScene = dynamic(() => import('@/app/components/BlockchainScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full" style={{ background: 'linear-gradient(180deg, #030014 0%, #0d0628 40%, #020a1a 100%)' }}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 text-neon-cyan animate-spin" />
        <p className="text-sm text-muted-foreground">Loading 3D scene…</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const { chain, isValid, autoMineFrom, isMining } = useBlockchain();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const firstInvalidIndex = chain.findIndex((block, i) => {
    if (i === 0) return block.hash !== block.calculateHash();
    const prev = chain[i - 1];
    return block.hash !== block.calculateHash() || block.previousHash !== prev.hash;
  });

  const selectedBlock = selectedIndex !== null ? chain[selectedIndex] : null;
  const selectedPrevBlock = selectedIndex !== null && selectedIndex > 0 ? chain[selectedIndex - 1] : null;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full-screen 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <BlockchainScene
            chain={chain}
            selectedIndex={selectedIndex}
            onSelectBlock={setSelectedIndex}
          />
        </Suspense>
      </div>

      {/* HTML Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        {/* Top: Header */}
        <div className="pointer-events-auto shrink-0">
          <Header />
        </div>

        {/* Middle area */}
        <div className="flex-1 relative">
          {/* Auto-Mine banner — floating top center */}
          <AnimatePresence>
            {!isValid && firstInvalidIndex >= 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="pointer-events-auto absolute top-3 left-1/2 -translate-x-1/2 w-auto max-w-sm z-20"
              >
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                  <div className="flex items-center gap-3 px-3 py-2">
                    <InfinityIcon className="h-3.5 w-3.5 text-red-400 shrink-0" />
                    <p className="text-[11px] text-red-300/80 whitespace-nowrap">
                      Block <span className="font-semibold text-red-400">#{firstInvalidIndex}</span> broken
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => autoMineFrom(firstInvalidIndex)}
                      disabled={isMining}
                      className="gap-1 border-red-500/20 text-red-400 hover:bg-red-500/10 text-[11px] h-6 px-2 shrink-0"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Fix
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hint — center */}
          <AnimatePresence>
            {selectedIndex === null && chain.length <= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                  <MousePointerClick className="h-5 w-5" />
                  <p className="text-[11px]">Click a block to inspect</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: Compact stats */}
        <div className="pointer-events-auto shrink-0 px-3 pb-3">
          <div className="mx-auto max-w-xl">
            <StatsDashboard />
          </div>
        </div>
      </div>

      {/* Block Detail Panel */}
      <AnimatePresence>
        {selectedBlock && selectedIndex !== null && (
          <BlockDetailPanel
            key={selectedIndex}
            block={selectedBlock}
            previousBlock={selectedPrevBlock}
            index={selectedIndex}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
