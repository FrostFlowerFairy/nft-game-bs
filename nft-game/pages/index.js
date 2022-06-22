import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { TWITTER_LINK, TWITTER_LINK_ZEE, TWITTER_HANDLE_ZEE, TWITTER_HANDLE } from '../constants'

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [network, setNetwork] = useState("");
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();


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
