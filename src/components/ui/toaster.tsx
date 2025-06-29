"use client"

import {
  Box,
  Toaster as ChakraToaster,
  Icon,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react"
import { useCallback } from "react";

import { IoIosInformationCircle } from "react-icons/io";
import { MdOutlineDownloadDone } from "react-icons/md";
import { TbAlertTriangleFilled } from "react-icons/tb";
import { IoClose } from "react-icons/io5";

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
})

export const Toaster = () => {
  const getToastIcon = useCallback((type: any) => {
    switch (type) {
      case "info":
        return <Icon as={IoIosInformationCircle} size={"lg"} />;
      case "success":
        return <Icon as={MdOutlineDownloadDone} size={"lg"} />;
      case "warning":
        return <Icon as={TbAlertTriangleFilled} size={"lg"} />;
      case "error":
        return <Icon as={IoClose} size={"lg"} />;
      default:
        return null;
    }
  }, []);

  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => (
          <Toast.Root rounded={"2xl"} width={{ md: "sm" }} justifyContent={"center"} alignItems={"center"} bg={"bg.panel"}>
            {toast.type === "loading" ? (
              <Spinner size="sm" color="blue.solid" />
            ) : (
              <Box display={"flex"} justifyContent={"center"} alignItems={"center"} p={"1"} rounded="full" h={"75%"} aspectRatio={1} bg={
                toast.type === "error"
                  ? "red.solid"
                  : toast.type === "success"
                    ? "green.solid"
                    : toast.type === "warning"
                      ? "yellow.solid"
                      : "bg.panel"
              }>
                {toast?.meta?.icon ? toast.meta.icon : getToastIcon(toast.type)}
              </Box>
            )}
            <Stack gap="0" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title
                fontWeight="semibold"
                color={
                  toast.type === "error"
                    ? "red.solid"
                    : toast.type === "success"
                      ? "green.solid"
                      : toast.type === "warning"
                        ? "yellow.solid"
                        : "fg"
                }
              >
                {toast.title}
              </Toast.Title>}
              {toast.description && (
                <Toast.Description color="fg">{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
