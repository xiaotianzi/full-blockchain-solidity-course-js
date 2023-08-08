"use client"

import { MoralisProvider } from "react-moralis"

export const metadata = {
  title: 'Smart Contract Lottery',
  description: 'Our Smart Contract Lottery',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <MoralisProvider initializeOnMount={false}>
        <body>{children}</body>
      </MoralisProvider>
    </html >
  )
}
