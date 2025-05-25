import { REOWN_PROJECT_ID } from '@/config/constants'
import { siteConfig } from '@/config/site'
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export const connector = walletConnect({
    projectId: REOWN_PROJECT_ID,
    metadata: {
        name: siteConfig.name,
        description: siteConfig.description,
        icons: [],
        url: siteConfig.url,
    }
})

export const config = createConfig({
    chains: [mainnet, sepolia],
    connectors: [connector],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    },
})