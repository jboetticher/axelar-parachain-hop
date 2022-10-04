const hre = require("hardhat");
const ethers = hre.ethers;
const {tokenName, testnetToMainnetChainName} = require("./gatewayGasReceiver");
const { AxelarQueryAPI, Environment, EvmChain } = require("@axelar-network/axelarjs-sdk");

// CONFIGURE YOUR RELEVANT CONSTANTS:

// Destination address (ReceiveCrossChainXToken) on Moonbase Alpha
const DESTINATION_ADDRESS = '0x00e91D316a1Ca712123B6D23008Aa3398Bb52901';

// Origin address (SendCrossChainXToken) on Fantom (or your EVM of choice)
const ORIGIN_ADDRESS = '0xc336fe98cce00483c1253f65350D28F8E4fEf1cb';

// Your centrifuge account IN HEX FORMAT
const CENTRIFUGE_ACCOUNT = '0xc4db7bcb733e117c0b34ac96354b10d47e84a006b9e7e66a229d174e8ff2a063';



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

  // Calculate potential cross-chain gas fee
  const axlearSDK = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const estimateGasUsed = 200000;
  const crossChainGasFee = await axlearSDK.estimateGasFee(
      testnetToMainnetChainName(hre.network.name),
      EvmChain.MOONBEAM,
      tokenName(hre.network.name),
      estimateGasUsed
  );

  /*
  Sending our cross-chain transaction! But what do all these values mean?

  Asset: Multilocation
    0 = parent is false (asset is native to the parachain)
    0x04 = pallet identifier, 0x24 = 36, which is the local asset pallet
    0x05 = general index identifier, 0xFD9D0BF45A2947A519A741C4B9E99EB6 = xUSDC assetId
  Amount: 300000, or just 30 cents
  Destination: Multilocation
    1 = parent is true (destination is not same parachain)
    0x00 = parachain identifier, 0x000007EF = 2031, the testnet Centrifuge parachain ID
    0x01 = polkadot account, CENTRIFUGE_ACCOUNT = the account we're sending to!
  */
  const tx = await sendContract.sendxUSDCToParachain(
    [0, ["0x0424", "0x05FD9D0BF45A2947A519A741C4B9E99EB6"]],
    300000,
    [1, ["0x00000007EF", "0x01" + CENTRIFUGE_ACCOUNT.slice(2) + "00"]],
    1000000000,
    DESTINATION_ADDRESS,
    { value: crossChainGasFee }
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