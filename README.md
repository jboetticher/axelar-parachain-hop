# Axelar Parachain Hop

This demo project allows you to transfer aUSDC from one Axelar connected EVM 
to a parachain with xUSDC. In this example, we used Fantom -> Moonbase Beta.

## Setup

You should have an account with DEV on Moonbase, FTM + aUSDC on Fantom.
Having an API key for Moonscan is optional, but **set `moonscanAPIKey` to null** if you don't have one.
You need a `secrets.json` file in the main directory in this format:
```
{
    "privateKey": "YOUR_PRIVATE_KEY",
    "moonscanAPIKey": "YOUR_MOONSCAN_API_KEY"
}
```

You can get aUSDC in Axelar's Discord faucet. [Join here](https://discord.com/invite/aRZ3Ra6f7D).

## Deployment & Transactions

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