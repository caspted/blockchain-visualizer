'use client';

import { useState, useEffect } from 'react';
import { useBlockchain } from '@/app/context/BlockchainContext';
import { Block } from '@/app/lib/blockchain';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Hash, Clock, Pickaxe, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlockDetailPanelProps {
  block: Block | null;
  previousBlock: Block | null;
  index: number;
  onClose: () => void;
}

export default function BlockDetailPanel({ block, previousBlock, index, onClose }: BlockDetailPanelProps) {
  const { updateBlockData, miningTimes } = useBlockchain();
  const [data, setData] = useState('');

  useEffect(() => {
    if (block) {
      setData(typeof block.data === 'string' ? block.data : JSON.stringify(block.data));
    }
  }, [block]);

  if (!block) return null;

  const hashMatches = block.hash === block.calculateHash();
  const linkValid = previousBlock ? block.previousHash === previousBlock.hash : true;
  const blockIsValid = hashMatches && linkValid;
  const miningTime = miningTimes.get(block.index);
  const truncateHash = (hash: string) => hash ? hash.substring(0, 20) + '…' : '—';

  const handleDataChange = (newData: string) => {
    setData(newData);
    updateBlockData(block.index, newData);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-50 glass-detail-panel overflow-y-auto pointer-events-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-neon-cyan/8 bg-[rgba(3,0,20,0.9)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
            index === 0 ? 'bg-neon-purple/15 neon-text-purple' : 'bg-neon-cyan/10 neon-text-cyan'
          }`}>
            {index === 0 ? <Sparkles className="h-4 w-4" /> : block.index}
          </div>
          <span className="font-semibold text-foreground/90">
            {index === 0 ? 'Genesis Block' : `Block #${block.index}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!blockIsValid && (
            <Badge
              variant="destructive"
              className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] px-2"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Invalid
            </Badge>
          )}
          {blockIsValid && (
            <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 text-[10px] px-2">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Timestamp */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Clock className="h-3 w-3 text-neon-cyan/50" />
          <time dateTime={new Date(block.timestamp).toISOString()}>
            {new Date(block.timestamp).toLocaleString()}
          </time>
        </motion.div>

        {/* Data editor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Data
          </label>
          <Textarea
            value={data}
            onChange={(e) => handleDataChange(e.target.value)}
            className="h-24 resize-none text-xs font-mono bg-white/[0.02] border-neon-cyan/8 focus:border-neon-cyan/20 focus:shadow-[0_0_15px_-3px_rgba(0,240,255,0.1)] transition-all"
            placeholder="Block data..."
            aria-label={`Data for block ${block.index}`}
          />
          <p className="text-[10px] text-muted-foreground/60">
            Edit data to see chain validation in real-time
          </p>
        </motion.div>

        {/* Nonce */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-between py-2 border-t border-neon-cyan/5"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Nonce
          </span>
          <span className="font-mono text-sm neon-text-cyan">{block.nonce}</span>
        </motion.div>

        {/* Previous Hash */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1.5"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Previous Hash
          </span>
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11px] ${
              linkValid ? 'hash-valid' : 'hash-invalid'
            }`}
            title={block.previousHash}
          >
            <Hash className="h-3 w-3 shrink-0 opacity-60" />
            <span className="truncate">{truncateHash(block.previousHash)}</span>
          </div>
        </motion.div>

        {/* Current Hash */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-1.5"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Hash
          </span>
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11px] ${
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
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-neon-cyan/5"
          >
            <Pickaxe className="h-3 w-3 text-neon-purple/60" />
            <span>
              Mined in <span className="font-semibold neon-text-cyan">{miningTime}ms</span>
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
