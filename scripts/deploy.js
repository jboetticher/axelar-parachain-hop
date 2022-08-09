const hre = require("hardhat");
const { getGatewayAddress, gasReceiverAddress, getWDEVAddress } = require("./gatewayGasReceiver");
const ethers = hre.ethers;

async function main() {
  await hre.run('compile');

  // Gets the gateway for our network
  const gatewayAddress = getGatewayAddress(hre.network.name);

  // Deploy our contract
  const CrossChainXToken = await ethers.getContractFactory("ReceiveCrossChainXToken");
  const executable = await CrossChainXToken.deploy(gatewayAddress);
  console.log("Deployed ReceiveCrossChainXToken on " + hre.network.name + " at: " + executable.address);
  // Wait for transactions
  console.log("Waiting for confirmations...")
  await ethers.provider.waitForTransaction(
    executable.deployTransaction.hash, 2);

  // Attempt to verify
  await hre.run("verify:verify", {
    address: executable.address,
    constructorArguments: [gatewayAddress],
  });
  console.log("Verification should be complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });