"use client";

import { Link, TabsList, TabsRoot, TabsRootProps, TabsTrigger } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type TradeTabValue = "swap" | "buy";

interface TradeTabsProps extends TabsRootProps { }
export function TradeTabs(props: TradeTabsProps) {
    const pathname = usePathname();
    const initialTab = pathname.match(/\/(swap|buy)/)?.[1] as TradeTabValue || "swap";
    const [activeTab, setActiveTab] = useState<TradeTabValue>(initialTab);

    return (
        <TabsRoot defaultValue={activeTab}>
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
