"use client";

import { toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

interface Props extends React.PropsWithChildren {

}
export const Provider: React.FC<Props> = ({ children }) => {
    // useEffect(() => {
    //     queueMicrotask(() => {
    //         toaster.dismiss("redirectingTo-profile");
    //         toaster.info({
    //             id: "info-welcomeTo-profile",
    //             title: "Chào mừng bạn đến với trang hồ sơ",
    //         });
    //     });

    //     return () => {
    //         toaster.dismiss("info-welcomeTo-profile");
    //     }
    // }, []);

    return (
        <>
            {children}
        </>
    );
};