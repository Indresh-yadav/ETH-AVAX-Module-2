# ETH-AVAX-Module-2

This Solidity smart contract, named "Assessment", implements a local store management system where the owner can add the items and the consumer can buy that item if it is available in the stock.

# Features

1. addProduct(): Allows the contract owner to add a new product to the contract's product list. 
2. purchaseProduct(): Allows a user to purchase a product by providing the exact Ether amount equal to the product price.
3. getBalance():  A view function that allows anyone to check the current balance of the contract.


# Starter Next/Hardhat Project

After cloning the github, you will want to do the following to get the code running on your computer.

For installing the libraries of the react
1. npm install styled-components
2. npm install react-icons


For installing the libraries for the hardhat
1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/


# Notes

Make sure to keep your contract secure and protected from unauthorized access.
This smart contract is provided under the "UNLICENSED" SPDX-License-Identifier, meaning it is not licensed for public use.
