import { HStack } from "@chakra-ui/react";
import { ProfileArea } from "./components/ProfileArea";
import { PersonalArea } from "./components/PersonalArea";

export default function Page() {

    return (
        <HStack w={"full"} h={"full"}>
            <ProfileArea flex={1} />
            <PersonalArea flex={3} />
        </HStack>
    );
}