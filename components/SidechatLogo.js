import React from 'react';
import styles from './SidechatLogo.module.css';

export default function SidechatLogo() {
  return (
    <div className={styles.logoContainer}>
      <svg 
        className={styles.logo}
        width="50" 
        height="50" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect fill="#7E57C2" x="0" y="0" width="100" height="100" rx="20"></rect>
        <path d="M80,40 C80,26.7452 69.2548,16 56,16 L44,16 C30.7452,16 20,26.7452 20,40 L20,50 C20,63.2548 30.7452,74 44,74 L50,74 L60,84 L60,74 L56,74 C69.2548,74 80,63.2548 80,50 L80,40 Z" fill="#FFFFFF"></path>
        <circle fill="#7E57C2" cx="35" cy="45" r="5"></circle>
        <circle fill="#7E57C2" cx="50" cy="45" r="5"></circle>
        <circle fill="#7E57C2" cx="65" cy="45" r="5"></circle>
      </svg>
    </div>
  );
}
