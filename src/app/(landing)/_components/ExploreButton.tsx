import { ConnectWalletButton } from "@/components/global/wallet";
import { ButtonProps } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Button, Link, LinkProps } from "@chakra-ui/react";

interface ExploreButtonProps extends LinkProps { }
export const ExploreButton: React.FC<ExploreButtonProps> = (props) => {
    return (
        <Link href={siteConfig.paths.docs.href} target="_blank" rel="noopener noreferrer" colorPalette="fg" color={"ƒg"} variant="plain" {...props}>
            Khám phá thêm
        </Link>
    )
}