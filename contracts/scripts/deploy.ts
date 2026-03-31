import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     AutoNad Deployment — Monad Testnet     ║");
  console.log("╚════════════════════════════════════════════╝");
  console.log(`\nDeploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} MON\n`);

  // 1. Deploy MockPriceFeed (MON/USDC — 8 decimals, initial price $42.00)
  console.log("→ Deploying MockPriceFeed (MON/USDC)...");
  const MockPriceFeed = await ethers.getContractFactory("MockPriceFeed");
  const priceFeed = await MockPriceFeed.deploy(
    4200_000_000, // $42.00 with 8 decimals
    8,
    "MON / USDC"
  );
  await priceFeed.waitForDeployment();
  const priceFeedAddress = await priceFeed.getAddress();
  console.log(`  ✓ MockPriceFeed deployed at: ${priceFeedAddress}`);

  // 2. Deploy AgentVault
  console.log("→ Deploying AgentVault...");
  const AgentVault = await ethers.getContractFactory("AgentVault");
  const agentVault = await AgentVault.deploy();
  await agentVault.waitForDeployment();
  const agentVaultAddress = await agentVault.getAddress();
  console.log(`  ✓ AgentVault deployed at: ${agentVaultAddress}`);

  // 3. Deploy LimitOrderBook (agent = deployer for now)
  console.log("→ Deploying LimitOrderBook...");
  const LimitOrderBook = await ethers.getContractFactory("LimitOrderBook");
  const limitOrderBook = await LimitOrderBook.deploy(deployer.address);
  await limitOrderBook.waitForDeployment();
  const limitOrderBookAddress = await limitOrderBook.getAddress();
  console.log(`  ✓ LimitOrderBook deployed at: ${limitOrderBookAddress}`);

  // 4. Write deployments.json
  const deployments = {
    network: "monad-testnet",
    chainId: 10143,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      MockPriceFeed: priceFeedAddress,
      AgentVault: agentVaultAddress,
      LimitOrderBook: limitOrderBookAddress,
    },
  };

  const deploymentsPath = path.resolve(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`\n✓ Deployments saved to deployments.json`);

  // 5. Print summary
  console.log("\n╔════════════════════════════════════════════╗");
  console.log("║              Deployment Summary             ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║ MockPriceFeed:   ${priceFeedAddress} ║`);
  console.log(`║ AgentVault:      ${agentVaultAddress} ║`);
  console.log(`║ LimitOrderBook:  ${limitOrderBookAddress} ║`);
  console.log("╚════════════════════════════════════════════╝");
  console.log(`\nExplorer: https://testnet.monadexplorer.com`);

  // 6. Update root .env with contract addresses
  const envPath = path.resolve(__dirname, "../../.env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  } else {
    const envExamplePath = path.resolve(__dirname, "../../.env.example");
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, "utf8");
    }
  }

  // Replace or append contract addresses
  const updateEnvVar = (content: string, key: string, value: string) => {
    const regex = new RegExp(`^${key}=.*`, "m");
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    }
    return content + `\n${key}=${value}`;
  };

  envContent = updateEnvVar(envContent, "NEXT_PUBLIC_LIMIT_ORDER_CONTRACT", limitOrderBookAddress);
  envContent = updateEnvVar(envContent, "NEXT_PUBLIC_AGENT_VAULT_CONTRACT", agentVaultAddress);
  envContent = updateEnvVar(envContent, "NEXT_PUBLIC_PRICE_FEED_CONTRACT", priceFeedAddress);

  fs.writeFileSync(envPath, envContent);
  console.log("✓ .env updated with contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✗ Deployment failed:", error);
    process.exit(1);
  });
