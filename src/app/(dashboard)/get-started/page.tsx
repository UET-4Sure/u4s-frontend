import { Center, For, Image, VStack } from "@chakra-ui/react";
import { SignInButton } from "./_components/SignInButton";
import NextImage from "next/image";

export default function GetStartedPage() {
    const supportAuthenticator = [
        {
            label: "Google",
            logoSrc: "/assets/logo-google.svg",
            authenticator: "google",
        },
        // facebook
        {
            label: "Facebook",
            logoSrc: "/assets/logo-facebook.svg",
            authenticator: "facebook",
        },
    ]
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
        </Center>
    )
}