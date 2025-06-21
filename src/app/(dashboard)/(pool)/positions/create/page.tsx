import { Center, Heading, VStack } from "@chakra-ui/react";
import { CreatePositionForm } from "./_components/CreatePositionForm";

export default function Page() {
    return (
        <Center w={"full"} h={"full"}>
            <VStack w={"full"} h={"full"} gap={"8"} maxW={["full", "full", "3/4"]} >
                <Heading as="h1" size="4xl" w={"full"}>
                    Vị thế mới
                </Heading>
                <CreatePositionForm flex={1} />
            </VStack >
        </Center >
    );
}