const hre = require("hardhat");
const { getGatewayAddress } = require("./gatewayGasReceiver");
const ethers = hre.ethers;

/**
 * This script deploys the "ReceiveCrossChainXToken" on Moonbase Alpha.
 * 
 * Remember that Moonbase Alpha is our destination chain, since it must receive aUSDC
 * to wrap it into xUSDC.
 * 
 * It will also verify the deployed contract if a Moonscan API key is available.
 */
async function main() {
  await hre.run('compile');
  if(hre.network !== 'moonbase') throw new Error("Origin chain must be Moonbase Alpha!");

  // Gets the gateway for our network
  const gatewayAddress = getGatewayAddress(hre.network.name);

  // Deploy our contract
  const CrossChainXToken = await ethers.getContractFactory("ReceiveCrossChainXToken");
  const executable = await CrossChainXToken.deploy(gatewayAddress);
  console.log("Deployed ReceiveCrossChainXToken on " + hre.network.name + " at: " + executable.address);  
  
  // Stop if no Moonscan API key is provided
  if(hre.userConfig.etherscan?.apiKey?.moonbaseAlpha == null) return;

  // Wait for transactions
  console.log("Waiting for confirmations...");
  await ethers.provider.waitForTransaction(
    executable.deployTransaction.hash, 2
  );

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