import { useState, useEffect } from "react";
import { ethers } from "ethers";
import store_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import styles from './HomePage.module.css'; 

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [store, setStore] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: 0, stock: 0 });
  const [showAccount, setShowAccount] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const storeABI = store_abi.abi;

  useEffect(() => {
    getWallet();
  }, [ethWallet]);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
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
      getStoreContract();
    } catch (error) {
      console.error("Failed to connect account:", error);
    }
  };

  const getStoreContract = () => {
    if (!ethWallet) return;

    try {
      const provider = new ethers.providers.Web3Provider(ethWallet, "any");
      const signer = provider.getSigner();
      const storeContract = new ethers.Contract(contractAddress, storeABI, signer);
      setStore(storeContract);
    } catch (error) {
      console.error("Failed to get store contract:", error);
    }
  };

  const getBalance = async () => {
    if (store) {
      try {
        const balance = await store.getBalance();
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Failed to get balance:", error);
      }
    }
  };

  const addProduct = async () => {
    if (store) {
      try {
        const tx = await store.addProduct(
          newProduct.name,
          ethers.utils.parseEther(newProduct.price.toString()), 
          newProduct.stock
        );

        await tx.wait();

        await getProducts();
      } catch (error) {
        console.error("Failed to add product:", error.message);
        console.error(error.stack);
      }
    } else {
      console.error("Store contract not initialized.");
    }
  };

  const getProducts = async () => {
    if (store) {
      try {
        const productCount = await store.nextProductId();
        let productsArray = [];
        for (let i = 0; i < productCount.toNumber(); i++) {
          const product = await store.products(i);
          productsArray.push({
            id: product.id.toNumber(),
            name: product.name,
            price: ethers.utils.formatEther(product.price),
            stock: product.stock.toNumber(),
          });
        }
        setProducts(productsArray);
      } catch (error) {
        console.error("Failed to get products:", error);
      }
    }
  };

  const purchaseProduct = async (id, price) => {
    if (store) {
      try {
        const tx = await store.purchaseProduct(id, { value: ethers.utils.parseEther(price.toString()) }); // Ensure price is a string
        await tx.wait();
        getProducts();
        getBalance();
      } catch (error) {
        console.error("Failed to purchase product:", error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this store.</p>;
    }

    if (!account) {
      return (
        <div className={styles.connectWalletContainer}>
          <p className={styles.connectWalletText} onClick={connectAccount}>
            Connect MetaMask Wallet
          </p>
        </div>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    if (products.length === 0) {
      getProducts();
    }

    return (
      <div className={styles.content}>
        <div className={styles.accountInfo}>
          <p>Your Account: {showAccount ? account : '••••••••••••••••••'}</p>
          <button onClick={() => setShowAccount(!showAccount)}>
            {showAccount ? 'Hide' : 'Show'} Account
          </button>
        </div>
        <div className={styles.balanceBox} onClick={getBalance}>
          <p>Your Balance: {balance ? `${balance} ETH` : 'Loading...'}</p>
        </div>
        <div className={styles.addProduct}>
          <h2>Add Product</h2>
          <div className={styles.addProductForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Name"
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price in ETH</label>
              <input
                id="price"
                type="number"
                placeholder="Price in ETH"
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stock">Stock</label>
              <input
                id="stock"
                type="number"
                placeholder="Stock"
                onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
              />
            </div>
            <button onClick={addProduct}>Add Product</button>
          </div>
        </div>
        <div className={styles.productsTable}>
          <h2>Products</h2>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price of Each Unit</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.price} ETH</td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      className={styles.buyButton}
                      onClick={() => purchaseProduct(product.id, product.price)}
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}><h1>Welcome to the Local Store!</h1></header>
      {initUser()}
    </main>
  );
}
