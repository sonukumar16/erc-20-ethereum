const MyToken = artifacts.require("MyToken.sol");
const MyTokenSale = artifacts.require('MyTokenSale.sol'); 

module.exports = async (deployer) => {
  const tokenPrice = 1000000000000000; 
  await deployer.deploy(MyToken, 1000000);
  return deployer.deploy(MyTokenSale, MyToken.address,tokenPrice);
};
