'use client';

import { useState } from 'react';
import { useBlockchain } from '@/app/context/BlockchainContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pickaxe, Loader2, Infinity as InfinityIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddBlockForm() {
  const { addBlock, isMining } = useBlockchain();
  const [data, setData] = useState('');
  const [lastMiningTime, setLastMiningTime] = useState<number | null>(null);
  const [justMined, setJustMined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim() || isMining) return;
    const elapsed = addBlock(data.trim());
    setLastMiningTime(elapsed);
    setData('');
    setJustMined(true);
    setTimeout(() => setJustMined(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.01, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="w-full glass-card rounded-xl border-dashed !border-neon-cyan/10 hover:!border-neon-cyan/20 overflow-hidden"
    >
      <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/15 to-transparent" />

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Plus className="h-4 w-4 text-neon-cyan/60" />
            <span>Add New Block</span>
            <InfinityIcon className="h-3.5 w-3.5 text-neon-purple/30 ml-auto" />
          </div>

          <Textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="h-16 resize-none text-xs font-mono bg-white/[0.02] border-neon-cyan/8 focus:border-neon-cyan/20 focus:shadow-[0_0_15px_-3px_rgba(0,240,255,0.1)] transition-all"
            placeholder="Enter block data..."
            disabled={isMining}
            aria-label="New block data"
          />

          <motion.div
            animate={isMining ? { scale: [1, 1.02, 1] } : justMined ? { scale: [1, 1.05, 1] } : {}}
            transition={isMining ? { repeat: Infinity, duration: 1.2 } : { duration: 0.3 }}
          >
            <Button
              type="submit"
              disabled={!data.trim() || isMining}
              className={`w-full gap-2 font-medium transition-all duration-300 ${
                justMined
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_-4px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 hover:from-neon-cyan/30 hover:to-neon-purple/30 border border-neon-cyan/20 text-neon-cyan hover:shadow-[0_0_20px_-4px_rgba(0,240,255,0.3)]'
              }`}
              size="sm"
            >
              {isMining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mining…
                </>
              ) : justMined ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Mined!
                </>
              ) : (
                <>
                  <Pickaxe className="h-4 w-4" />
                  Add &amp; Mine Block
                </>
              )}
            </Button>
          </motion.div>

          <AnimatePresence>
            {lastMiningTime !== null && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-xs text-muted-foreground"
              >
                Last block mined in <span className="font-semibold neon-text-cyan">{lastMiningTime}ms</span>
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
}
