import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Seeding testnet with mock data...");

  const deploymentsPath = path.resolve(__dirname, "../deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("deployments.json not found — run deploy first");
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  console.log("Loaded deployments:", deployments.contracts);

  // Get contracts
  const priceFeed = await ethers.getContractAt(
    "MockPriceFeed",
    deployments.contracts.MockPriceFeed
  );

  // Simulate price movements
  console.log("Simulating price updates...");
  const prices = [4150_000_000, 4300_000_000, 4100_000_000, 4450_000_000, 4380_000_000];

  for (const price of prices) {
    const tx = await priceFeed.setPrice(price);
    await tx.wait();
    console.log(`  Price set to $${price / 1e8}`);
  }

  console.log("✓ Seed complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
