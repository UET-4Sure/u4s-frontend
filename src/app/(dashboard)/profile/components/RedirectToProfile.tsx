"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { redirect } from "next/navigation";

interface Props extends React.PropsWithChildren { }
export const RedirectToProfile: React.FC<Props> = ({ children }) => {
    const { address } = useAppKitAccount();

    redirect(`/profile/${address}`);
}