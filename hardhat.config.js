require("@nomicfoundation/hardhat-toolbox");

const { privateKey, moonscanAPIKey } = require('./secrets.json');

module.exports = {
  solidity: "0.8.15",
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.gateway.pokt.network/v1/lb/62a0c8ff87017d0039b81bb6',
      chainId: 3,
      accounts: [privateKey]
    },
    moonbase: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287, // 0x507 in hex,
      accounts: [privateKey]
    },
    mumbai: {
      url: 'https://matic-mumbai.chainstacklabs.com',
      chainId: 80001,
      accounts: [privateKey]
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      accounts: [privateKey]
    },
    fantom: {
      url: 'https://rpc.testnet.fantom.network/',
      chainId: 4002,
      accounts: [privateKey]
    },
    aurora: {
      url: 'https://testnet.aurora.dev/',
      chainId: 1313161555,
      accounts: [privateKey]
    },
    bnb: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      chainId: 97,
      accounts: [privateKey]
    }
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: moonscanAPIKey // Moonbeam Moonscan API Key    
    }
  }
};