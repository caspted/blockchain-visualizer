'use client';

import { useState } from 'react';
import { useBlockchain } from '@/app/context/BlockchainContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Infinity as InfinityIcon,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Plus,
  Pickaxe,
  Sparkles,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { isValid, difficulty, setDifficulty, isMining, addBlock } = useBlockchain();
  const [showAddBlock, setShowAddBlock] = useState(false);
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
    setTimeout(() => {
      setJustMined(false);
    }, 1500);
  };

  return (
    <header className="glass-header sticky top-0 z-50 w-full">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 animate-glow-pulse" />
            <InfinityIcon className="relative h-5 w-5 sm:h-6 sm:w-6 neon-text-cyan" aria-hidden="true" />
          </motion.div>
          <h1 className="text-sm sm:text-lg font-bold tracking-tight">
            <span className="neon-text-cyan">∞</span>
            <span className="ml-1 text-foreground">Chain</span>
            <span className="ml-1 text-muted-foreground font-normal hidden sm:inline">Visualizer</span>
          </h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mining indicator */}
          <AnimatePresence>
            {isMining && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-1.5 text-xs text-neon-cyan"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Mining…</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chain validity badge */}
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Badge
              variant={isValid ? 'default' : 'destructive'}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium transition-all duration-500 ${
                isValid
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_15px_-3px_rgba(0,240,255,0.2)]'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]'
              }`}
              aria-label={isValid ? 'Blockchain is valid' : 'Blockchain is invalid'}
            >
              {isValid ? (
                <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              ) : (
                <ShieldAlert className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              )}
              <span className="hidden sm:inline">{isValid ? 'Valid' : 'Invalid'}</span>
            </Badge>
          </motion.div>

          {/* Difficulty selector */}
          <div className="flex items-center gap-1.5">
            <Select
              value={String(difficulty)}
              onValueChange={(val) => setDifficulty(Number(val))}
            >
              <SelectTrigger
                id="difficulty"
                className="h-7 sm:h-8 w-[55px] sm:w-[65px] text-[10px] sm:text-xs bg-neon-cyan/5 border-neon-cyan/10"
                aria-label="Select mining difficulty"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0a28] border-neon-cyan/10">
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Block button */}
          <Button
            size="sm"
            onClick={() => setShowAddBlock(!showAddBlock)}
            className="gap-1.5 h-7 sm:h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 hover:from-neon-cyan/30 hover:to-neon-purple/30 border border-neon-cyan/20 text-neon-cyan hover:shadow-[0_0_20px_-4px_rgba(0,240,255,0.3)] transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Block</span>
          </Button>
        </div>
      </div>

      {/* Add Block Popup — drops down from header */}
      <AnimatePresence>
        {showAddBlock && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAddBlock(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute right-3 sm:right-6 top-full mt-2 z-50 w-[calc(100vw-24px)] sm:w-[360px] glass-card rounded-xl overflow-hidden"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

              <div className="p-4">
                {/* Modal header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Pickaxe className="h-4 w-4 text-neon-cyan/60" />
                    <span>Add New Block</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowAddBlock(false)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="h-20 resize-none text-xs font-mono bg-white/[0.02] border-neon-cyan/8 focus:border-neon-cyan/20 focus:shadow-[0_0_15px_-3px_rgba(0,240,255,0.1)] transition-all"
                    placeholder="Enter block data..."
                    disabled={isMining}
                    aria-label="New block data"
                    autoFocus
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
                          Mine Block
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
                        Mined in <span className="font-semibold neon-text-cyan">{lastMiningTime}ms</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
