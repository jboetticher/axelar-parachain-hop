const hre = require("hardhat");
const ethers = hre.ethers;

// CONFIGURE YOUR RELEVANT CONSTANTS:

// Destination address (ReceiveCrossChainXToken) on Moonbeam
const DESTINATION_ADDRESS = '0x87f6Fec8625BaC3efDAF537C3C8058C1a88d9467';

// Origin address (SendCrossChainXToken) on Fantom (or your EVM of choice)
const ORIGIN_ADDRESS = '0xc336fe98cce00483c1253f65350D28F8E4fEf1cb';



/**
 * npx hardhat run scripts/axelarSend.js --network fantom
 * 
 * This script deploys the "ReceiveCrossChainXToken" on Moonbase Alpha.
 * 
 * Remember that Moonbase Alpha is our destination chain, since it must receive aUSDC
 * to wrap it into xUSDC.
 * 
 * It will also verify the deployed contract if a Moonscan API key is available.
 */
async function main() {
  await hre.run('compile');

  // Connect to contract
  const sendContract = await ethers.getContractAt(
    "SendCrossChainXToken", 
    ORIGIN_ADDRESS);

  // Send our transaction
  // TODO: must change for centrifuge & add explanation on what this is
  const tx = await sendContract.sendxUSDCToParachain(
    [0, ["0x0424", "0x05FD9D0BF45A2947A519A741C4B9E99EB6"]],
    300000,
    [1, ["0x0000000378", "0x030394c0edfcca370b20622721985b577850b0eb7500"]],
    1000000000,
    DESTINATION_ADDRESS,
    { value: 263251366000000 }
  );

  console.log(tx);
  console.log("Transaction: " + tx.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });