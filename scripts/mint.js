const hre = require("hardhat");
const { AxelarQueryAPI, Environment, EvmChain } = require("@axelar-network/axelarjs-sdk");
const {tokenName} = require("./gatewayGasReceiver");

const ethers = hre.ethers;
const axlearSDK = new AxelarQueryAPI({
    environment: Environment.TESTNET,
});

// moonbase alpha:      0x28B465072e40496154088a92D7f98f295F9c78E9
// fantom testnet:      0xf9e7DEF9c01345794c9c4c3a17DeF0e5a677C10E

async function main() {
    await hre.run('compile');



    const estimateGasUsed = 200000;
    const gasFee = await axlearSDK.estimateGasFee(
        testnetToMainnetChainName(hre.network.name),
        EvmChain.MOONBEAM,
        tokenName(hre.network.name),
        estimateGasUsed
    );
    const gasFeeToHuman = ethers.utils.formatEther(ethers.BigNumber.from(gasFee));
    console.log(`Cross-Chain Gas Fee: ${gasFee} Wei / ${gasFeeToHuman} Ether`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });