'use client';

import PoolList from '@/components/PoolList';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';

export default function Page() {
    return (
        <Container maxW="container.xl" py={8}>
            <VStack gap={6} align="stretch">
                <Box>
                    <Heading size="4xl">Các pool hiện có</Heading>
                    <Text color="fg.muted">Khám phá và tương tác với các pool thanh khoản của chúng tôi</Text>
                </Box>
                <PoolList />
            </VStack>
        </Container>
    );
}