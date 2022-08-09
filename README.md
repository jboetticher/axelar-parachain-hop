# Axelar Parachain Hop

This demo project allows you to transfer aUSDC from one Axelar connected EVM 
to a parachain with xUSDC. In this example, we used Fantom -> Moonbase Beta.

## Setup

You should have an account with DEV on Moonbase, FTM + aUSDC on Fantom.
You need a `secrets.json` file in the main directory in this format:
```
{
    "privateKey": "YOUR_PRIVATE_KEY"
}
```

Deploy origin chain contract
```
npx hardhat run scripts/originDeploy.js --network fantom
```

Deploy destination chain contract
```
npx hardhat run scripts/deploy.js --network moonbase
```

Send transaction
```
npx hardhat run scripts/axelarSend.js --network fantom
```