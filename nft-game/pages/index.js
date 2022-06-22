import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { TWITTER_LINK, TWITTER_LINK_ZEE, TWITTER_HANDLE_ZEE, TWITTER_HANDLE } from '../constants'
import LoadingIndicator from '../components/LoadingIndicator/'
import Arena from '../styles/Arena.module.css';
import SelectCharacter from '../styles/SelectCharacter.module.css'

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState("");
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
    if (chainId !== 3) {
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
          setWalletConnected(true);
          const address = await provider.getAddress();
          console.log(address)
          setCurrentAccount(address)
    
        } catch (err) {
          console.error(err);
        }
      };


      const renderConnectionContainer = () => {
        if (walletConnected) {
          if (loading) {
            return (
              <div className={styles.formContainer}>
                <img src="/assets/nerdzone.gif" alt="Nerd gif" />
                <LoadingIndicator />
              </div>
            );
    
    
          }
          if (currentAccount) {
            return (
              <div className={styles.connectedWalletContainer}>
                <button size="small" className={`${styles.ctaButton} ${styles.connectedWalletButton}`}>
                  Connected
                </button>
                <img src="/assets/nerdzone.gif" alt="Nerd gif" />
                {renderInputForm()}
              </div>
            )
          }
    
        } else {
          return (
            <div className={styles.connectWalletContainer}>
              <img src="/assets/nerdzone.gif" alt="Nerd gif" />
              <button onClick={connectWallet} className={`${styles.ctaButton} ${styles.connectWalletButton}`}>
                Connect Your Wallet
              </button>
            </div>
          );
        }
      }
    



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
          <div className={styles.connectWalletContainer}>
            <img
              src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
              alt="Monty Python Gif"
            // className={styles.subText}
            />
            <button
              className={`${styles.button} ${styles.connectWalletButton}`}
              onClick={connectWallet}
            >
              Connect Wallet To Get Started
            </button>
          </div>
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
