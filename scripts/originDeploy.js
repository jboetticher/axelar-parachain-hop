const hre = require("hardhat");
const { getGatewayAddress } = require("./gatewayGasReceiver");
const ethers = hre.ethers;

async function main() {
  await hre.run('compile');

  // Gets the gateway for our network
  const gatewayAddress = getGatewayAddress(hre.network.name);

  // Deploy our contract
  const SendCrossChainXToken = await ethers.getContractFactory("SendCrossChainXToken");
  const executable = await SendCrossChainXToken.deploy(gatewayAddress);
  console.log("Deployed SendCrossChainXToken on " + hre.network.name + " at: " + executable.address);

  // Approve contract for transfers
  const fantomUSDC = await ethers.getContractAt("IERC20", "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61");
  const approveTx = await fantomUSDC.approve(executable.address, 100000000);
  console.log("Approved aUSDC. Transaction: " + approveTx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });