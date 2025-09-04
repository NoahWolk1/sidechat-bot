import Head from 'next/head';
import BotControl from '../components/BotControl';
import SidechatLogo from '../components/SidechatLogo';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Sidechat Bot Controller</title>
        <meta name="description" content="Control panel for Sidechat bot" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <header className="header">
        <SidechatLogo />
        <h1>Sidechat Bot Controller</h1>
        <p>Configure and control your <span className="brand-text">Sidechat</span> posting bot</p>
      </header>

      <main>
        <BotControl />
      </main>

      <footer className="footer">
        <div className="footer-divider"></div>
        <p>&copy; {new Date().getFullYear()} <span className="brand-text">Sidechat</span> Bot • Made with 💜</p>
      </footer>
      
      <style jsx>{`
        .footer-divider {
          width: 50px;
          height: 4px;
          background: linear-gradient(to right, var(--primary-purple), var(--light-purple));
          margin: 0 auto 1rem auto;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
