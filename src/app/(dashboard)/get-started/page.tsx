import { Center, For } from "@chakra-ui/react";
import { SignInButton } from "./_components/SignInButton";

export default function GetStartedPage() {
    const supportAuthenticator = [
        {
            label: "Google",
            icon: null,
            authenticator: "google",
        },
    ]
    return (
        <Center>
            <h1>Get Started</h1>
            <p>Welcome to the Get Started page! Here you can find resources and guides to help you begin your journey.</p>
            <For each={supportAuthenticator}>
                {({ label, icon, authenticator }) => (
                    <SignInButton key={authenticator} authenticator={authenticator} />
                )}
            </For>
        </Center>
    )
}