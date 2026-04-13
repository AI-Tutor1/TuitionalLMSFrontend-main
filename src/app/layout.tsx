import type { Metadata } from "next";
import "./globals.css";
import MainProvider from "./provider";
import Marquee from "@/components/global/marquee/marquee";
import { ThemeProvider } from "@/components/global/theme-provider/theme-provider";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Tuitional LMS",
  description: "Learning Management By Tuitionaledu",
  icons: {
    icon: { url: "/assets/images/logo.png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {/* <NextTopLoader color="var(--main-blue-color)" showSpinner={false} /> */}
        <MainProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false} // Add this line to disable system theme
            disableTransitionOnChange
          >
            <Marquee />
            {children}
          </ThemeProvider>
        </MainProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const body = document.body;
              const attributesToRemove = Object.keys(body.attributes).map(
                key => body.attributes[key].name
              ).filter(name => 
                name.startsWith('__processed_') || 
                name.startsWith('bis_')
              );
              attributesToRemove.forEach(attr => {
                body.removeAttribute(attr);
              });
            });
          `,
          }}
        />
      </body>
    </html>
  );
}
