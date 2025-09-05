import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div className="app-wrapper">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
