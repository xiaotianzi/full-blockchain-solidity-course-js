"use client"

import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"
import "./globals.css"

// export const metadata = {
//   title: 'Smart Contract Lottery',
//   description: 'Our Smart Contract Lottery',
// }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
          <body>{children}</body>
        </NotificationProvider>
      </MoralisProvider>
    </html >
  )
}
