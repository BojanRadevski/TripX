import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import "../styles/globals.css";
import { useEffect } from "react";
import { hydrateFromStorage } from "../redux/slices/authSlice";
import { Toaster } from "react-hot-toast";

function InnerApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    store.dispatch(hydrateFromStorage());
  }, []);

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <InnerApp {...props} />
      <Toaster position="top-center" />
    </Provider>
  );
}
