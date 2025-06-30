import { VStack, Container, Heading, Text } from "@chakra-ui/react";
import { FaucetWidget } from "@/components/widgets/faucet/Faucet";

export default function FaucetPage() {
    return (
        <Container maxW="container.sm" p={"8"}>
            <VStack gap={"6"} w={"full"} align="start" h={"full"}>
                <VStack align="stretch">
                    <Heading size="4xl">Token Faucet</Heading>
                    <Text color={"fg.subtle"}>Nhấp vào bất kỳ token nào để mint token vào ví của bạn</Text>
                </VStack>
                <FaucetWidget />
            </VStack>
        </Container>
    );
} 