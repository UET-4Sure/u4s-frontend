import { REOWN_PROJECT_ID } from '@/config/constants'
import { siteConfig } from '@/config/site'
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'

export const walletConnectConnector = walletConnect({
    projectId: REOWN_PROJECT_ID,
    metadata: {
        name: siteConfig.name,
        description: siteConfig.description,
        icons: [],
        url: siteConfig.url,
    },
})

export const injectedConnector = injected({
    shimDisconnect: true,
    target: "metaMask",
})

export const coinbaseConnector = coinbaseWallet({
    appName: siteConfig.name,
    appLogoUrl: siteConfig.url + '/favicon.ico',
})

export const config = createConfig({
    chains: [mainnet, sepolia],
    connectors: [
        walletConnectConnector,
        coinbaseConnector,
        injectedConnector,
    ],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
})