
import { useState, useEffect, useRef } from 'react'
import { CONTRACT_ADDRESS, CONTRACT_ABI, transformCharacterData } from '../../constants'
import { providers, Contract, utils } from "ethers";
import styles from '../../styles/SelectCharacter.module.css'
import LoadingIndicator from '../../components/LoadingIndicator/'


const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    const [mintingCharacter, setMintingCharacter] = useState(false);


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

            /*
             * This is the big difference. Set our gameContract in state.
             */
            setGameContract(gameContract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log('Getting contract characters to mint');

                /*
                 * Call contract to get all mint-able characters
                 */
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log('charactersTxn:', charactersTxn);

                /*
                 * Go through all of our characters and transform the data
                 */
                const characters = charactersTxn.map((characterData) =>
                    transformCharacterData(characterData)
                );

                /*
                 * Set all mint-able characters in state
                 */
                setCharacters(characters);
            } catch (error) {
                console.error('Something went wrong fetching characters:', error);
            }
        };

        /*
        * Add a callback method that will fire when this event is received
        */
        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );

            /*
             * Once our character NFT is minted we can fetch the metadata from our contract
             * and set it in state to move onto the Arena
             */
            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log('CharacterNFT: ', characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
            }
            window.alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        };

        /*
         * If our gameContract is ready, let's get characters!
         */
        if (gameContract) {
            getCharacters();

            gameContract.on('CharacterNFTMinted', onCharacterMint);
        }

        return () => {
            /*
             * When your component unmounts, let;s make sure to clean up this listener
             */
            if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint);
            }
        };
    }, [gameContract]);

    const mintCharacterNFTAction = async (characterId) => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log('Minting character in progress...');
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log('mintTxn:', mintTxn);

                setMintingCharacter(false);
            }
        } catch (error) {
            console.warn('MintCharacterAction Error:', error);

            setMintingCharacter(false);
        }
    };


    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className={styles.characterItem} key={character.name}>
                <div className={styles.nameContainer}>
                    <p>{character.name}</p>
                </div>
                <img src={character.imageURI} alt={character.name} />
                <button
                    type="button"
                    className={styles.characterMintButton}
                    onClick={() => mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div>
        ));



    return (
        <div className={styles.selectCharacterContainer}>
            <h2>Mint Your Hero. Choose wisely.</h2>
            {/* Only show this when there are characters in state */}
            {characters.length > 0 && (
                <div className={styles.characterGrid}>
                    {renderCharacters()}
                </div>
            )}
            {/* Only show our loading state if mintingCharacter is true */}
            {mintingCharacter && (
                <div className={styles.loading}>
                    <div className={styles.indicator}>
                        <LoadingIndicator />
                        <p>Minting In Progress...</p>
                    </div>
                    <img
                        src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
                        alt="Minting loading indicator"
                    />
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;