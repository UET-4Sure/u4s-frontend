import { TradeTabs } from "./_components/TradeTabs";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <TradeTabs />
            {children}
        </>
    );
}