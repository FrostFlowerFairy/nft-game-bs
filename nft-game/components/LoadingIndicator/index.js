import React from 'react';
import styles from '../../styles/Loader.module.css';

const LoadingIndicator = () => {
  return (
    <div className={styles.ldsRing}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default LoadingIndicator;
