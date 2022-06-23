


import { useState, useEffect, useRef } from 'react'
import { CONTRACT_ADDRESS, CONTRACT_ABI, transformCharacterData } from '../../constants'
import { providers, Contract, utils } from "ethers";
import styles from '../../styles/Toast.module.css'
import LoadingIndicator from '../../components/LoadingIndicator/'


const Toast = ({ showToast, characterNFT, boss }) => {


    return (
        <div id="toast" className={showToast ? `${styles.show}` : ''}>
            <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
    )

}


export default Toast;