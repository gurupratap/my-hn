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
      <body className="flex h-screen flex-col overflow-hidden">
        <Navbar />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <footer className="shrink-0 bg-white py-3 text-center text-sm text-gray-500 border-t border-gray-200">
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
