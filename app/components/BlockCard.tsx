'use client';

import { useState, useEffect } from 'react';
import { useBlockchain } from '@/app/context/BlockchainContext';
import { Block } from '@/app/lib/blockchain';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Hash, AlertTriangle, Pickaxe, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlockCardProps {
  block: Block;
  previousBlock: Block | null;
  index: number;
}

export default function BlockCard({ block, previousBlock, index }: BlockCardProps) {
  const { updateBlockData, miningTimes } = useBlockchain();
  const [data, setData] = useState(typeof block.data === 'string' ? block.data : JSON.stringify(block.data));
  const [expanded, setExpanded] = useState(false);

  const hashMatches = block.hash === block.calculateHash();
  const linkValid = previousBlock ? block.previousHash === previousBlock.hash : true;
  const blockIsValid = hashMatches && linkValid;

  const miningTime = miningTimes.get(block.index);
  const truncateHash = (hash: string) => hash ? hash.substring(0, 16) + '…' : '—';

  useEffect(() => {
    const blockData = typeof block.data === 'string' ? block.data : JSON.stringify(block.data);
    setData(blockData);
  }, [block.data]);

  const handleDataChange = (newData: string) => {
    setData(newData);
    updateBlockData(block.index, newData);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className={`relative w-full rounded-xl overflow-hidden cursor-pointer select-none
        ${!blockIsValid ? 'glass-card-invalid' : 'glass-card'}
      `}
      onClick={() => setExpanded(!expanded)}
      aria-label={`Block ${block.index}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
    >
      {/* Top glow accent */}
      <div className={`absolute top-0 left-0 right-0 h-px ${
        index === 0
          ? 'bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent'
          : blockIsValid
            ? 'bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent'
      }`} />

      {/* Compact header — always visible */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          index === 0
            ? 'bg-neon-purple/15 neon-text-purple'
            : 'bg-neon-cyan/10 neon-text-cyan'
        }`}>
          {index === 0 ? <Sparkles className="h-4 w-4" /> : block.index}
          <div className={`absolute inset-0 rounded-lg ${
            index === 0 ? 'neon-border-purple' : 'neon-border-cyan'
          } opacity-30`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground/90">
            {index === 0 ? 'Genesis Block' : `Block #${block.index}`}
          </p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock className="h-2.5 w-2.5" />
            {new Date(block.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!blockIsValid && (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-2 shadow-[0_0_10px_-2px_rgba(239,68,68,0.3)]"
            >
              <AlertTriangle className="h-3 w-3" />
              Invalid
            </Badge>
          )}

          {miningTime !== undefined && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Pickaxe className="h-2.5 w-2.5 text-neon-purple/60" />
              {miningTime}ms
            </span>
          )}

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
          </motion.div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 sm:px-4 pb-4 space-y-3 border-t border-neon-cyan/5 pt-3">
              {/* Data */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Data
                </label>
                <Textarea
                  value={data}
                  onChange={(e) => handleDataChange(e.target.value)}
                  className="h-16 resize-none text-xs font-mono bg-white/[0.02] border-neon-cyan/8 focus:border-neon-cyan/20 focus:shadow-[0_0_15px_-3px_rgba(0,240,255,0.1)] transition-all"
                  placeholder="Block data..."
                  aria-label={`Data for block ${block.index}`}
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>

              {/* Nonce */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Nonce
                </span>
                <span className="font-mono text-xs neon-text-cyan opacity-80">{block.nonce}</span>
              </motion.div>

              {/* Previous Hash */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-1"
              >
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Prev Hash
                </span>
                <div
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] ${
                    linkValid ? 'hash-valid' : 'hash-invalid'
                  }`}
                  title={block.previousHash}
                >
                  <Hash className="h-3 w-3 shrink-0 opacity-60" />
                  <span className="truncate">{truncateHash(block.previousHash)}</span>
                </div>
              </motion.div>

              {/* Hash */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1"
              >
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Hash
                </span>
                <div
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] ${
                    hashMatches ? 'hash-valid' : 'hash-invalid'
                  }`}
                  title={block.hash}
                >
                  <Hash className="h-3 w-3 shrink-0 opacity-60" />
                  <span className="truncate">{truncateHash(block.hash)}</span>
                </div>
              </motion.div>

              {/* Mining time */}
              {miningTime !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1.5 border-t border-neon-cyan/5"
                >
                  <Pickaxe className="h-3 w-3 text-neon-purple/60" />
                  <span>Mined in <span className="font-semibold neon-text-cyan text-[11px]">{miningTime}ms</span></span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
