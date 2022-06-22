import React, { useEffect, useState } from 'react';
import styles from '../../styles/SelectCharacter.module.css'

const SelectCharacter = ({ setCharacterNFT }) => {
    return (
        <div className={styles.selectCharacterContainer}>
            <h2>Mint Your Hero. Choose wisely.</h2>
        </div>
    );
};

export default SelectCharacter;