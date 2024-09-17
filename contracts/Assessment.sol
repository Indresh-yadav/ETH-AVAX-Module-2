// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    struct Product {
        uint256 id;
        string name;
        uint256 price;
        uint256 stock;
    }

    mapping(uint256 => Product) public products;
    uint256 public nextProductId;

    event ProductAdded(uint256 id, string name, uint256 price, uint256 stock);
    event ProductPurchased(uint256 id, string name, uint256 price, uint256 stock);
    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor() payable {
    owner = payable(msg.sender);
    balance = msg.value; 
}


    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function addProduct(string memory _name, uint256 _price, uint256 _stock) public onlyOwner {
        products[nextProductId] = Product(nextProductId, _name, _price, _stock);
        emit ProductAdded(nextProductId, _name, _price, _stock);
        nextProductId++;
    }

    function purchaseProduct(uint256 _id) public payable {
        Product storage product = products[_id];
        require(product.stock > 0, "Product out of stock");
        require(msg.value == product.price, "Incorrect value sent");

        product.stock--;
        balance += msg.value;

        emit ProductPurchased(_id, product.name, product.price, product.stock);
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit() public payable onlyOwner {
        uint _previousBalance = balance;
        balance += msg.value;
        assert(balance == _previousBalance + msg.value);
        emit Deposit(msg.value);
    }

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        require(balance >= _withdrawAmount, "Insufficient balance");
        uint _previousBalance = balance;
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
        owner.transfer(_withdrawAmount);
    }
}
