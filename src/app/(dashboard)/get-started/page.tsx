import { Center, For, Image, VStack } from "@chakra-ui/react";
import { ConnectWalletButton, SignInButton } from "./_components/AuthenticateButton";
import NextImage from "next/image";

export default function GetStartedPage() {
    const supportAuthenticator = [
        {
            label: "Google",
            logoSrc: "/assets/logo-google.svg",
            authenticator: "google",
        },
        {
            label: "Facebook",
            logoSrc: "/assets/logo-facebook.svg",
            authenticator: "facebook",
        },
    ]

    const connectWallet = {
        label: "Connect Wallet",
        logoSrc: "/assets/logo-connect-wallet.svg",
    }

    return (
        <Center>
            <h1>Get Started</h1>
            <p>Welcome to the Get Started page! Here you can find resources and guides to help you begin your journey.</p>
            <For each={supportAuthenticator}>
                {({ label, logoSrc, authenticator }) => (
                    <VStack key={authenticator}>
                        <Image asChild>
                            <NextImage
                                src={logoSrc}
                                alt={`${label} logo`}
                                width={48}
                                height={48}
                            />
                        </Image>
                        <SignInButton key={authenticator} authenticator={authenticator} label={label} />
                    </VStack>
                )}
            </For>
            <VStack key={connectWallet.label}>
                <Image asChild>
                    <NextImage
                        src={connectWallet.logoSrc}
                        alt={`${connectWallet.label} logo`}
                        width={48}
                        height={48}
                    />
                </Image>
                <ConnectWalletButton />
            </VStack>
        </Center>
    )
}