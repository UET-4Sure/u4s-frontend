"use client";

import { toaster } from "@/components/ui/toaster";
import { useAppKitAccount } from "@reown/appkit/react";
import { redirect } from "next/navigation";

interface Props extends React.PropsWithChildren { }
export const RedirectToProfile: React.FC<Props> = ({ }) => {
    const { address } = useAppKitAccount();

    // toaster.loading({
    //     id: "redirectingTo-profile",
    //     title: "Xin vui long đợi",
    //     description: "Đang chuyển hướng đến trang hồ sơ của bạn",
    // })

    if (!address) {

        return <></>;
    }

    redirect(`/profile/${address}`);
}