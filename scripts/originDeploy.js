const hre = require("hardhat");
const { getGatewayAddress, getUSDCAddress } = require("./gatewayGasReceiver");
const ethers = hre.ethers;

/**
 * npx hardhat run scripts/originDeploy.js --network fantom
 * 
 * This script deploys the "SendCrossChainXToken" on Fantom (or whichever network you choose).
 * It also approves has the deployer approve it for 100 aUSDC.
 */
async function main() {
  await hre.run('compile');

  // Gets the gateway & aUSDC for our network
  const gatewayAddress = getGatewayAddress(hre.network.name);
  const aUSDCAddress = getUSDCAddress(hre.network.name);

  // Deploy our contract
  const SendCrossChainXToken = await ethers.getContractFactory("SendCrossChainXToken");
  const executable = await SendCrossChainXToken.deploy(gatewayAddress);
  console.log("Deployed SendCrossChainXToken on " + hre.network.name + " at: " + executable.address);

  // Approve contract for transfers (100 buckaroos)
  const fantomUSDC = await ethers.getContractAt("IERC20", aUSDCAddress);
  const approveTx = await fantomUSDC.approve(executable.address, 100000000);
  console.log("Approved aUSDC. Transaction: " + approveTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });