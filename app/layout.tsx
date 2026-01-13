import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "my-hn",
  description: "Hacker News NextJS application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t border-gray-200">
          <p>
            Powered by{" "}
            <a
              href="https://github.com/HackerNews/API"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:underline"
            >
              Hacker News API
            </a>{" "}
            | © Y Combinator (
            <a
              href="https://github.com/HackerNews/API/blob/master/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              MIT License
            </a>
            )
          </p>
        </footer>
      </body>
    </html>
  );
}
