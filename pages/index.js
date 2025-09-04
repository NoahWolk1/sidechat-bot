import Head from 'next/head';
import BotControl from '../components/BotControl';

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Sidechat Bot Controller</title>
        <meta name="description" content="Control panel for Sidechat bot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <h1>Sidechat Bot Controller</h1>
        <p>Configure and control your Sidechat posting bot</p>
      </header>

      <main>
        <BotControl />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Sidechat Bot</p>
      </footer>
    </div>
  );
}
