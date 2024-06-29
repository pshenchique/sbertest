const AgeVerifier = artifacts.require("AgeVerifier");

module.exports = function (deployer) {
  deployer.deploy(AgeVerifier);
};