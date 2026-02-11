'use client';

import { useBlockchain } from '@/app/context/BlockchainContext';
import { Blocks, Timer, Gauge, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsDashboard() {
  const { chain, miningTimes, difficulty } = useBlockchain();

  const totalBlocks = chain.length;
  const times = Array.from(miningTimes.values());
  const avgMiningTime = times.length > 0
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : 0;

  const stats = [
    {
      label: 'Total Blocks',
      value: totalBlocks,
      icon: Blocks,
      gradient: 'from-neon-cyan/15 to-neon-blue/15',
      glow: 'neon-text-cyan',
      iconColor: 'text-neon-cyan',
      borderColor: 'border-neon-cyan/10',
    },
    {
      label: 'Avg Mining Time',
      value: `${avgMiningTime}ms`,
      icon: Timer,
      gradient: 'from-neon-purple/15 to-neon-pink/15',
      glow: 'neon-text-purple',
      iconColor: 'text-neon-purple',
      borderColor: 'border-neon-purple/10',
    },
    {
      label: 'Difficulty',
      value: difficulty,
      icon: Gauge,
      gradient: 'from-neon-blue/15 to-neon-cyan/15',
      glow: '',
      iconColor: 'text-neon-blue',
      borderColor: 'border-neon-blue/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="region" aria-label="Blockchain statistics">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className={`glass-card rounded-xl ${stat.borderColor} overflow-hidden`}
        >
          <div className={`h-px bg-gradient-to-r ${stat.gradient}`} />
          <div className="flex items-center gap-3 py-3 px-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <motion.p
                key={String(stat.value)}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-lg font-bold leading-none ${stat.glow}`}
              >
                {stat.value}
              </motion.p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
            <InfinityIcon className="h-3 w-3 text-neon-cyan/10 hidden sm:block" aria-hidden="true" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
