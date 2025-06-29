"use client";

import { redirect } from "next/navigation";

export function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    redirect("/swap");

    return <>{children}</>;
}