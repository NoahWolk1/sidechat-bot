import Head from 'next/head';
import BotControl from '../components/BotControl';
import SidechatLogo from '../components/SidechatLogo';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sidechat Bot Controller</title>
        <meta name="description" content="Control panel for Sidechat bot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <SidechatLogo />
        <h1>Sidechat Bot Controller</h1>
        <p>Configure and control your <span className={styles.brandText}>Sidechat</span> posting bot</p>
      </header>

      <main className={styles.main}>
        <BotControl />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerDivider}></div>
        <p>&copy; {new Date().getFullYear()} <span className={styles.brandText}>Sidechat</span> Bot • Made with 💜</p>
      </footer>
    </div>
  );
}
