"use client"

import { MoralisProvider } from "react-moralis"

export const metadata = {
  title: 'NFT Marketplace',
  description: 'NFT Marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <MoralisProvider initializeOnMount={false}>
        <body>{children}</body>
      </MoralisProvider>
    </html>
  )
}
