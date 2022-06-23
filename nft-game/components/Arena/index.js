
import { useState, useEffect, useRef } from 'react'
import { CONTRACT_ADDRESS, CONTRACT_ABI, transformCharacterData } from '../../constants'
import { providers, Contract, utils } from "ethers";
import styles from '../../styles/Arena.module.css'
import LoadingIndicator from '../../components/LoadingIndicator/'
import Toast from '../../components/Toast/'


const Arena = ({ characterNFT, setCharacterNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null);

  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    /*
     * Setup async function that will get the boss from our contract and sets in state
     */
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log('Boss:', bossTxn);
      setBoss(transformCharacterData(bossTxn));
    };

    const onAttackComplete = (from, newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      const sender = from.toString();

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

      /*
      * If player is our own, update both player and boss Hp
      */
      if (currentAccount === sender.toLowerCase()) {

        setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
        });
        setCharacterNFT((prevState) => {
          return { ...prevState, hp: playerHp };
        });
      }
      /*
      * If player isn't ours, update boss Hp only
      */
      else {
        setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
        });
      }
    }

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }

    /*
    * Make sure to clean up this event when this component is removed
    */
    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackComplete);
      }
    }
  }, [gameContract]);

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);


  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');

        /*
        * Set your toast state to true and then false 5 seconds later
        */
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };


  return (
    <div className={styles.arenaContainer}>

      {boss && characterNFT && (
        <Toast showToast={showToast} boss={boss} characterNFT={characterNFT} />
      )}


      {/* Boss */}
      {boss && (
        <div className={styles.bossContainer}>
          <div className={`${styles.bossContent} ${styles.attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className={styles.imageContent}>
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className={styles.healthBar}>
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className={styles.attackContainer}>
            <button className={styles.ctaButton} onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
            {attackState === 'attacking' && (
              <div className="loading-indicator">
                <LoadingIndicator />
                <p>Attacking ⚔️</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Character NFT */}
      {characterNFT && (
        <div className={styles.playersContainer}>
          <div className={styles.playerContainer}>

            <div className={styles.player}>
              <div className={styles.imageContent}>
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className={styles.healthBar}>
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className={styles.stats}>
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
            <h2>Your Character</h2>
          </div>
          <div className={styles.activePlayers}>
            <h2>Active Players</h2>
            <div className={styles.playersList}>{renderActivePlayersList()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;