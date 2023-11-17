import { SharedAuthProvider } from "@/providers/shared-auth.provider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DM_Sans } from "next/font/google";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const dm_sans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={dm_sans.className}>
      <CookiesProvider>
        <SharedAuthProvider>
          <Component {...pageProps} />
        </SharedAuthProvider>
      </CookiesProvider>
      <ToastContainer
        bodyClassName={dm_sans.className}
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </main>
  );
}
