import { ethers } from "hardhat";
const TM = "0xF445400ceA7ea987AD4F4aE16AE7e3c7aEd797eA";
const WN = "0xBe02a451Dc21A07AF63Af75420A8ea2060Ede76A";
async function main() {
  const action = process.env.ACTION;
  if (action === "base") {
    const tm = await ethers.getContractAt("TaskManager", TM);
    const tx = await tm.setPeer(40231, ethers.zeroPadValue(WN, 32));
    console.log("Base setPeer:", tx.hash); await tx.wait();
  } else if (action === "arb") {
    const wn = await ethers.getContractAt("WorkerNode", WN);
    const tx = await wn.setPeer(40245, ethers.zeroPadValue(TM, 32));
    console.log("Arb setPeer:", tx.hash); await tx.wait();
  }
}
main().catch(console.error);
