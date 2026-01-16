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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="flex h-dvh flex-col overflow-hidden">
        <Navbar />
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <footer className="flex h-12 shrink-0 items-center justify-center border-t border-gray-200 bg-white text-[clamp(0.625rem,2.5vw,0.875rem)] text-gray-500">
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
