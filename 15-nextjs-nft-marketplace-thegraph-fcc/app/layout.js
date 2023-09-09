"use client"

import { MoralisProvider } from "react-moralis"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import { NotificationProvider } from "web3uikit"
import "./globals.css"

const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

export const metadata = {
  title: 'NFT Marketplace',
  description: 'NFT Marketplace',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <body>{children}</body>
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </html>
  )
}
