const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

async function main() {
  // Ensure the deployer is Account #0
  const [deployer] = await hre.ethers.getSigners();

  const Factory = await hre.ethers.getContractFactory('AccessControlABAC', deployer);
  const contract = await Factory.deploy(); // constructor makes deployer the admin
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log('AccessControlABAC deployed at:', address);
  console.log('Admin (deployer):', deployer.address);

  // Write ABI + address to frontend
  const artifact = await hre.artifacts.readArtifact('AccessControlABAC');
  const outDir = path.resolve(__dirname, '..', '..', 'dapp-frontend', 'src', 'lib');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'abi.json'), JSON.stringify(artifact.abi, null, 2));
  fs.writeFileSync(path.join(outDir, 'contract-address.json'), JSON.stringify({ address }, null, 2));
  console.log('✅ Wrote abi.json & contract-address.json to dapp-frontend/src/lib');
}

main().catch((e) => { console.error(e); process.exit(1); });
