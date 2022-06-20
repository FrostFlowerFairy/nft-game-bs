require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const ALCHEMY_API_KEY_URL_RINKEBY = process.env.ALCHEMY_API_KEY_URL_RINKEBY;
const ALCHEMY_API_KEY_URL_ROPSTEN = process.env.ALCHEMY_API_KEY_URL_ROPSTEN;
const ALCHEMY_API_KEY_URL_MUMBAI = process.env.ALCHEMY_API_KEY_URL_MUMBAI;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

//API KEY IS NEEDED for etherscan Contract verifications through hardhat.
//then -> npx hardhat verify YOUR_CONTRACT_ADDRESS --network rinkeby 
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  solidity: "0.8.10",
  networks: {
    rinkeby: {
      url: ALCHEMY_API_KEY_URL_RINKEBY,
      accounts: [PRIVATE_KEY],
    },
    ropsten: {
      url: ALCHEMY_API_KEY_URL_ROPSTEN,
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: ALCHEMY_API_KEY_URL_MUMBAI,
      accounts: [PRIVATE_KEY],
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  }
};