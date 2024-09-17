// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  const Assessment = await ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy({ value: ethers.utils.parseEther("1.0") }); // Deploy with 1 ETH initial balance

  console.log("Contract deployed to address:", assessment.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
