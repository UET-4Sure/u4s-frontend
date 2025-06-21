import { Center, Text } from "@chakra-ui/react";
import { HeroSection } from "./HeroSection";
import { Cover } from "./_components/Cover";

export default function Home() {
  return (
    <Center>
      <Cover/>
      <HeroSection />
    </Center>
  );
}
