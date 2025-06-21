import { Image, ImageProps } from "@chakra-ui/react";
import NextImage from "next/image";

interface BrandLogoProps extends ImageProps { }
export const BrandLogo: React.FC<BrandLogoProps> = (props) => {
    return (
        <Image asChild {...props}>
            <NextImage
                src="/RootFaviconLight.png"
                alt="Brand Logo"
                width={48}
                height={48}
            />
        </Image>
    )
}