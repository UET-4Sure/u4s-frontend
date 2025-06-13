"use client";

import { For, Link, TabsContent, TabsList, TabsRoot, TabsRootProps, TabsTrigger } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type TradeTabValue = "swap" | "buy";

interface TradeTabsProps extends TabsRootProps {
    component?: React.ReactElement;
}
export function TradeTabs(props: TradeTabsProps) {
    const { component } = props;
    const pathname = usePathname();
    const initialTab = pathname.match(/\/(swap|buy)/)?.[1] as TradeTabValue || "swap";
    const [activeTab, setActiveTab] = useState<TradeTabValue>(initialTab);

    const tabs = [
        {
            value: "swap" as TradeTabValue,
            label: "Trao đổi",
            href: "/swap",
            component: component
        },
        {
            value: "buy" as TradeTabValue,
            label: "Bán",
            href: "/buy",
            component: component
        }
    ]
    return (
        <TabsRoot
            _open={{
                animationName: "fade-in, scale-in",
                animationDuration: "300ms",
            }}
            _closed={{
                animationName: "fade-out, scale-out",
                animationDuration: "120ms",
            }}
            variant={"subtle"}
            defaultValue={activeTab}
        >
            <TabsList>
                <For each={tabs}>
                    {(tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            rounded={"full"}
                            _selected={{
                                bg: "bg.subtle",
                                shadow: "sm",
                                animationName: "scale-in",
                                animationDuration: "120ms"
                            }}
                            asChild
                        >
                            <Link unstyled asChild>
                                <NextLink href={tab.href}>
                                    {tab.label}
                                </NextLink>
                            </Link>
                        </TabsTrigger>
                    )}
                </For>
            </TabsList>
            <For each={tabs}>
                {(tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        {tab.component}
                    </TabsContent>
                )}
            </For>
        </TabsRoot>
    )
}
