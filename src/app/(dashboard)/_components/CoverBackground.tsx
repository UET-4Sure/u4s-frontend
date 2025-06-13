import { Center, CenterProps, Image } from "@chakra-ui/react";
import NextImage from "next/image";

interface Props extends CenterProps { }
export const CoverBackground: React.FC<Props> = ({ children, ...props }) => {
    return (
        <Center
            position={"absolute"}
            top={0}
            left={0}
            w={"full"}
            h={"full"}
            zIndex={-1}
            {...props}
        >
            <Image asChild pos={"absolute"} pointerEvents={"none"}>
                <NextImage
                    src={"/assets/bg-cover-plateau.png"}
                    alt={"Plateau Background"}
                    fill
                />
            </Image>
        </Center>
    );
};