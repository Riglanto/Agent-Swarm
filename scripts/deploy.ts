import { ethers } from "hardhat";

const LZ_ENDPOINT = "0x6EDCE65403992e310A62460808c4b910D972f10f";

async function main() {
  const [deployer] = await ethers.getSigners();
  const chain = process.env.CHAIN;
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);

  async function deploy(name: string, args: any[]) {
    console.log(`Deploying ${name}...`);
    const F = await ethers.getContractFactory(name);
    const c = await F.deploy(...args);
    await c.waitForDeployment();
    const addr = await c.getAddress();
    console.log(`  ${name}: ${addr}`);
    await new Promise(r => setTimeout(r, 3000));
    return addr;
  }

  if (chain === "base") {
    const tm = await deploy("TaskManager", [LZ_ENDPOINT, deployer.address]);
    const reg = await deploy("WorkerRegistry", []);
    console.log(`\n  TASK_MANAGER=${tm}\n  REGISTRY=${reg}`);
  } else if (chain === "arb") {
    const wn = await deploy("WorkerNode", [LZ_ENDPOINT, deployer.address]);
    console.log(`\n  WORKER_NODE=${wn}`);
  } else {
    console.log("Set CHAIN=base or CHAIN=arb");
  }
}

main().catch(console.error);
