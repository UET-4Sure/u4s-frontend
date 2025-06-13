import { Link, TabsList, TabsRoot, TabsRootProps, TabsTrigger } from "@chakra-ui/react";
import NextLink from "next/link";

interface TradeTabsProps extends TabsRootProps { }
export function TradeTabs(props: TradeTabsProps) {
    return (
        <TabsRoot>
            <TabsList>
                <TabsTrigger value="swap" asChild>
                    <Link unstyled asChild>
                        <NextLink href={"/swap"}>
                            Trao đổi
                        </NextLink>
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="buy" asChild>
                    <Link unstyled asChild>
                        <NextLink href={"/buy"}>
                            Bán
                        </NextLink>
                    </Link>
                </TabsTrigger>

            </TabsList>
        </TabsRoot>
    )
}
