import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { REOWN_PROJECT_ID } from '@/config/constants';
import { metadata } from '@/app/layout';
import { CreateAppKit, createAppKit } from '@reown/appkit';
import { siteConfig } from '@/config/site';

const networks = [mainnet, sepolia];

const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId: REOWN_PROJECT_ID,
    networks,
})

const appKit: CreateAppKit = {
    networks: networks as any,
    defaultNetwork: sepolia,
    projectId: REOWN_PROJECT_ID,
    adapters: [wagmiAdapter],
    themeMode: 'light',
    themeVariables: {
        "--w3m-font-family": "Sora, sans-serif",
        "--w3m-color-mix": "rgb(246, 238, 217)",
        "--w3m-accent": "rgb(255, 161, 3)",
        "--w3m-color-mix-strength": 75,
    },
    metadata: {
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        icons: ["https:localhost:3000/RootFaviconLight.png"],
    },
    enableAuthLogger: true,
    enableNetworkSwitch: true,
    enableWalletConnect: true,
}

export default {
    networks,
    wagmiAdapter,
    appKit
}