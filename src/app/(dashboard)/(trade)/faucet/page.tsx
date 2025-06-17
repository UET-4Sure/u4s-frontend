"use client";

import { VStack, Container, Heading } from "@chakra-ui/react";
import { FaucetWidget } from "@/components/widgets/faucet/Faucet";

export default function FaucetPage() {
    return (
        <Container maxW="container.sm" py={8}>
            <VStack gap={6} align="stretch">
                <Heading size="lg" textAlign="center">Token Faucet</Heading>
                <FaucetWidget />
            </VStack>
        </Container>
    );
} 