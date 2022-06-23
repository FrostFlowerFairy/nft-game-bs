import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect, useRef } from 'react'
import { TWITTER_LINK, TWITTER_LINK_ZEE, TWITTER_HANDLE_ZEE, TWITTER_HANDLE, CONTRACT_ADDRESS, CONTRACT_ABI, transformCharacterData } from '../constants'
import { providers, Contract, utils } from "ethers";
import Web3Modal from "web3modal";
import LoadingIndicator from '../components/LoadingIndicator/'
import SelectCharacter from '../components/SelectCharacter';
import Arena from '../components/Arena';

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [characterNFT, setCharacterNFT] = useState(null);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();


  /**
     * Returns a Provider or Signer object representing the Ethereum RPC with or without the
     * signing capabilities of metamask attached
     *
     * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
     *
     * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
     * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
     * request signatures from the user using Signer functions.
     *
     * @param {*} needSigner - True if you need the signer, default false otherwise
     */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId, name } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }
    setNetwork(name);
    console.log(`Network > ${name}`)

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      const provider = await getProviderOrSigner(true);
      const address = await provider.getAddress();
      console.log(address)
      setCurrentAccount(address)
      setWalletConnected(true);

    } catch (err) {
      console.error(err);
    }
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    setLoading(true);
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      // connectWallet();
    }
  }, [walletConnected]);


  /*
 * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
 */
  useEffect(() => {
    /*
     * The function we will call that interacts with out smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);


      const signer = await getProviderOrSigner(true);
      const gameContract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
      /*
     * Once we are done with all the fetching, set loading state to false
     */
      setLoading(false);
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (walletConnected) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [walletConnected]);

  const renderConnectionContainer = () => {


    if (walletConnected) {
      if (loading) {
        return (
          <LoadingIndicator />
        );
      }
      // Senario #2
      if (currentAccount && !characterNFT) {
        return (
          <div>
            <button size="small" className={`${styles.ctaButton} ${styles.connectedWalletButton}`}>
              Connected
            </button>
            <SelectCharacter setCharacterNFT={setCharacterNFT} />;
          </div>
        )
      } else if (currentAccount && characterNFT) {
        // Senario #3 - If user has connected to the app AND does have a character NFT - Show Arena Component
        return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
      }

    } else {
      // Senario #1
      return (
        <button onClick={connectWallet} className={`${styles.ctaButton} ${styles.connectWalletButton}`}>
          Connect Your Wallet
        </button>
      );
    }
  }



  console.log(`Char NFT >> ${characterNFT}`)


  return (
    <div className={styles.App}>
      <Head>
        <title>NFT Game</title>
        <meta name="description" content="NFT game created by Zayn" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.container}>
        <div className={styles.headerContainer}>
          <p className={`${styles.header} ${styles.gradientText}`}>⚔️ Metaverse Anime Slayer ⚔️</p>
          <p className={styles.subText}>Team up to protect the Anime Metaverse!</p>


          {!characterNFT && <div className={styles.connectWalletContainer}>
            <img
              width={walletConnected ? 300 : ''}
              src="https://media3.giphy.com/media/JTjiT1dvFdSpi/giphy.gif"
              alt="DBZ Anime Team"
            />
          </div>}
          {renderConnectionContainer()}
        </div>

      </main>

      <footer className={styles.footerContainer}>
        <img alt="Twitter Logo" className={styles.twitterLogo} src="/assets/twitter-logo.svg" />
        <a
          className={styles.footerText}
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >{`built with @${TWITTER_HANDLE} `}</a>
        &nbsp;
        <a
          className={styles.footerText}
          href={TWITTER_LINK_ZEE}
          target="_blank"
          rel="noreferrer"
        >{` by SZeeS @${TWITTER_HANDLE_ZEE} `}</a>
      </footer>
    </div>
  )
}
