# CLAUDE.md — Cross-Chain Agent Swarm

Context file for new Claude sessions working on this project.

## Project Overview

Multi-agent system where a **Planner** on Base decomposes tasks, discovers **Workers** via an on-chain registry, dispatches subtasks cross-chain to Arbitrum via **LayerZero V2**, collects results, and releases ETH rewards.

## Architecture

- **TaskManager.sol** (Base, OApp) — Creates tasks with ETH escrow, dispatches to workers cross-chain, receives result hashes, releases rewards. Status machine: Created -> Dispatched -> Completed -> Paid.
- **WorkerNode.sol** (Arbitrum, OApp) — Receives dispatched tasks via LZ `_lzReceive`, stores locally. Workers call `submitResult` to send result hash back to TaskManager via `_lzSend`.
- **WorkerRegistry.sol** (any chain) — Workers self-register with capability string + chain EID. Planner queries `findWorkers(capability)` to discover agents.

## Key Constants

- Base EID: `30184`
- Arbitrum EID: `40231`
- Dispatch payload: `abi.encode(taskId, description, reward, worker)`
- Result payload: `abi.encode(taskId, resultHash, worker)`

## Commands

```bash
npm install          # Install dependencies
npx hardhat compile  # Compile contracts
npx hardhat test     # Run 9 tests (all passing)
npx hardhat run agent/swarm-agent.ts  # Run agent demo
```

## Testing Approach

Tests use `EndpointV2Mock` from `@layerzerolabs/oapp-evm` and `hardhat_impersonateAccount` to simulate cross-chain LZ message delivery in a single Hardhat network. The `deliverMessage` helper impersonates the endpoint address to call `lzReceive` directly.

## File Structure

```
contracts/
  TaskManager.sol      # Planner OApp (Base)
  WorkerNode.sol       # Worker OApp (Arbitrum)
  WorkerRegistry.sol   # Worker directory
test/
  Swarm.test.ts        # 9 tests covering all contracts + lifecycle
agent/
  swarm-agent.ts       # Planner agent demo script
docs/
  banner.svg           # Animated SVG banner
  how-it-works.html    # Interactive visualization with animated flow
  architecture.html    # Contract architecture page
```

## Do Not Modify

- `contracts/*.sol` — Finalized contracts
- `test/Swarm.test.ts` — Finalized test suite
- `agent/swarm-agent.ts` — Finalized agent demo

## Tech Stack

- Solidity 0.8.27 (cancun EVM, optimizer 200 runs)
- Hardhat with TypeScript
- LayerZero V2 OApp (`@layerzerolabs/oapp-evm ^0.0.4`)
- OpenZeppelin Contracts 5.1+ (Ownable)
- Networks: Base Sepolia, Arbitrum Sepolia
