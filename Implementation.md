Implementation Plan: Blockchain Visualizer
1. Project Context & Rules
Role: Senior Front-end Engineer.

Architecture: Next.js (App Router), TypeScript, Tailwind CSS, Lucide React (icons), and Shadcn/UI (components).

Core Logic: Use the existing Block and Blockchain classes in @/lib/blockchain.ts.

Engineering Standard: Use functional components, strictly typed props, and atomic design. Prioritize accessibility (ARIA labels) and responsive layouts.

2. Phase 1: Global State & Layout
Blockchain Provider: Create a React Context to hold the Blockchain instance. This ensures the Validation Indicator updates globally when any block is edited or mined.
+1

Header/Status Bar:

A sticky top bar displaying the Validation Indicator: "Chain Valid" (Green) or "Chain Invalid" (Red).
+1

Integrate the Difficulty Selector (Dropdown: 1, 2, 3, 4) in the header.


Main Canvas: A horizontally scrolling container for the blocks to visualize the "chain" progression.

3. Phase 2: The Block Component (BlockCard.tsx)
Create a card for each block displaying the following fields:


Index: Block number (e.g., Block #0).


Timestamp: Formatted date/time.


Data Input: A textarea allowing users to edit data for the Tampering Demo.
+1


Nonce: Read-only display of the mined nonce.

Hash Displays:


Previous Hash: First 10 characters + "...".


Hash: First 10 characters + "...".


Visual Linking: Implement a logic where if currentBlock.previousHash === previousBlock.hash, both strings are highlighted in a matching success color (e.g., emerald-500).

4. Phase 3: Mining & Validation Logic
Mining Interaction:

"Mine" button on the card or a global "Add Block" form.

Show a Loading Spinner and "Mining..." text during the mineBlock() execution.

On completion, display the Mining Time (e.g., "Mined in 45ms").

Validation Trigger:

Any change to a block’s data field must instantly recalculate that block's hash and trigger a chain-wide isChainValid() check.
+1

Invalid blocks must display a Red Border and an "Invalid" badge.

5. Phase 4: UI/UX Refinement (Bonus Features)

Auto-Mine: A button to re-mine the entire chain from a tampered block onwards to restore validity.


Statistics Dashboard: A small panel showing total blocks, average mining time, and current difficulty.
+1
