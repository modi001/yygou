const HDWalletProvider = require('@truffle/hdwallet-provider');
//const mnemonic = "piece crime cross image salute gasp layer clay name pear abstract stay";
const mnemonic = "bone mercy sell umbrella into topic flee cake pony exclude move kiwi";
// 0xA9315f87713ab9665Ae00D111D8CDbaE5253Ed03

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },

    goerli: {
      provider: () => new HDWalletProvider(mnemonic, 'https://goerli.infura.io/v3/fcc441b410ab4e9bacbc3568f997a4fd'),
      network_id: 5, // Goerli's network id
      chain_id: 5, // Goerli's chain id
      gas: 5500000, // Gas limit used for deploys.
      confirmations: 2, // # of confirmations to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out (minimum/default: 50)
      skipDryRun: true // Skip dry run before migrations? (default: false for public nets)
    },

    develop: {
      port: 8545
    }
  },
  compilers: {
    solc: {
        version: "0.8.10"
    }
}
};
