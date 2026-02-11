'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Block, Blockchain } from '@/app/lib/blockchain';

interface BlockchainContextType {
  chain: Block[];
  isValid: boolean;
  difficulty: number;
  setDifficulty: (d: number) => void;
  addBlock: (data: string) => number; // returns mining time in ms
  updateBlockData: (index: number, newData: string) => void;
  autoMineFrom: (index: number) => void;
  miningTimes: Map<number, number>;
  isMining: boolean;
}

const BlockchainContext = createContext<BlockchainContextType | null>(null);

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error('useBlockchain must be used within BlockchainProvider');
  return ctx;
}

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const blockchainRef = useRef(new Blockchain());
  const [chain, setChain] = useState<Block[]>([...blockchainRef.current.chain]);
  const [isValid, setIsValid] = useState(true);
  const [difficulty, setDifficultyState] = useState(2);
  const [miningTimes, setMiningTimes] = useState<Map<number, number>>(new Map());
  const [isMining, setIsMining] = useState(false);

  const refreshChain = useCallback(() => {
    const bc = blockchainRef.current;
    setChain([...bc.chain]);
    setIsValid(bc.isChainValid());
  }, []);

  const setDifficulty = useCallback((d: number) => {
    blockchainRef.current.difficulty = d;
    setDifficultyState(d);
  }, []);

  const addBlock = useCallback((data: string): number => {
    setIsMining(true);
    const bc = blockchainRef.current;
    const newBlock = new Block(bc.chain.length, Date.now(), data, '');
    const start = performance.now();
    bc.addBlock(newBlock);
    const elapsed = Math.round(performance.now() - start);
    setMiningTimes(prev => {
      const next = new Map(prev);
      next.set(newBlock.index, elapsed);
      return next;
    });
    refreshChain();
    setIsMining(false);
    return elapsed;
  }, [refreshChain]);

  const updateBlockData = useCallback((index: number, newData: string) => {
    const bc = blockchainRef.current;
    if (index < 0 || index >= bc.chain.length) return;
    const block = bc.chain[index];
    block.data = newData;
    block.hash = block.calculateHash();
    refreshChain();
  }, [refreshChain]);

  const autoMineFrom = useCallback((index: number) => {
    setIsMining(true);
    const bc = blockchainRef.current;
    for (let i = index; i < bc.chain.length; i++) {
      const block = bc.chain[i];
      if (i > 0) {
        block.previousHash = bc.chain[i - 1].hash;
      }
      block.nonce = 0;
      const start = performance.now();
      block.mineBlock(bc.difficulty);
      const elapsed = Math.round(performance.now() - start);
      setMiningTimes(prev => {
        const next = new Map(prev);
        next.set(block.index, elapsed);
        return next;
      });
    }
    refreshChain();
    setIsMining(false);
  }, [refreshChain]);

  return (
    <BlockchainContext.Provider
      value={{
        chain,
        isValid,
        difficulty,
        setDifficulty,
        addBlock,
        updateBlockData,
        autoMineFrom,
        miningTimes,
        isMining,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}
