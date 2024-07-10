import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styled, { keyframes } from "styled-components";
import { MdAccountBalanceWallet, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

const Container = styled.main`
  text-align: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f0f0f0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
`;

const Header = styled.header`
  width: 100%;
  margin-bottom: 20px;
  text-align: center;
  position: relative;
`;

const moveHeader = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  color: green;
  margin-top: 20px;
  margin-bottom: 0;
  animation: ${moveHeader} 3s ease-in-out infinite;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  margin: 10px;
  padding: 10px 20px;
  font-size: 1.2rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-3px);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const BalanceInfo = styled.div`
  margin-bottom: 20px;
`;

const BalanceLabel = styled.p`
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const BalanceAmount = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #E333FF;
`;

const AccountInfo = styled.div`
  margin-bottom: 20px;

  p {
    font-size: 1.5rem;
    margin-bottom: 10px;

    svg {
      margin-right: 10px;
    }
  }
`;

const TransactionList = styled.ul`
  list-style-type: none;
  padding: 0;
  text-align: left;
  margin-top: 20px;

  li {
    margin-bottom: 10px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;

    svg {
      font-size: 1.5rem;
      margin-right: 10px;
    }

    .deposit {
      color: green;
    }

    .withdrawal {
      color: red;
    }
  }
`;

const Toast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${(props) => (props.error ? "#dc3545" : "#28a745")};
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
`;

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactions, setTransactions] = useState([]);
  const [toast, setToast] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        handleAccount(accounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        showToast(`Error fetching accounts: ${error.message}`, true);
      }
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      showToast(`Account connected: ${accounts[0]}`);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
      showToast("No account found", true);
      setAccount(undefined);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
      showToast(`Error connecting account: ${error.message}`, true);
    }
  };

  const getATMContract = () => {
    if (ethWallet) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
      setATM(atmContract);
      getBalance();
    }
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error);
        showToast(`Error fetching balance: ${error.message}`, true);
      }
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        const tx = await atm.deposit(1);
        await tx.wait();
        getBalance();
        addTransaction("Deposit", 1);
        showToast("Deposit successful");
      } catch (error) {
        console.error("Error depositing:", error);
        showToast(`Error depositing: ${error.message}`, true);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        const tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
        addTransaction("Withdraw", -1);
        showToast("Withdrawal successful");
      } catch (error) {
        console.error("Error withdrawing:", error);
        showToast(`Error withdrawing: ${error.message}`, true);
      }
    }
  };

  const viewAccount = () => {
    if (account) {
      alert(`Account Address: ${account}`);
    } else {
      alert("No account connected");
    }
  };

  const addTransaction = (type, amount) => {
    const newTransaction = {
      type: type,
      amount: amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <Container>
      <Header>
        <HeaderTitle>Welcome to the Metacrafters ATM!</HeaderTitle>
      </Header>
      {toast && <Toast error={toast.isError}>{toast.message}</Toast>}
      
      <ButtonRow>
        <Button onClick={connectAccount}>Connect Metamask Wallet</Button>
        <Button onClick={viewAccount}><MdAccountBalanceWallet /> View Account Address</Button>
      </ButtonRow>

      <ButtonRow>
        <Button onClick={deposit}><MdArrowDownward /> Deposit 1 ETH</Button>
        <Button onClick={withdraw}><MdArrowUpward /> Withdraw 1 ETH</Button>
      </ButtonRow>

      <BalanceInfo>
        <BalanceLabel>Your Balance:</BalanceLabel>
        <BalanceAmount>{balance !== undefined ? `${balance} ETH` : "Loading..."}</BalanceAmount>
      </BalanceInfo>

      <h2>Transaction History</h2>
      <TransactionList>
        {transactions.map((tx, index) => (
          <li key={index} className={tx.type === "Deposit" ? "deposit" : "withdrawal"}>
            {tx.type === "Deposit" ? <MdArrowDownward /> : <MdArrowUpward />}{" "}
            {tx.amount} ETH ({tx.timestamp})
          </li>
        ))}
      </TransactionList>
    </Container>
  );
}
