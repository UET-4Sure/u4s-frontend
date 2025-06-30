import { Button } from "@/components/ui/button";
import { DialogContent, DialogRoot, DialogHeader, DialogBody, DialogTitle, DialogCloseTrigger, DialogFooter } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { ETHEREUM_TESTNET_EXPLORER_URL, IDENTITY_SBT_CONTRACT_ADDRESS } from "@/config/constants";
import { formatAddress } from "@/libs";
import { Box, DialogRootProps, For, Heading, HStack, IconButton, Image, Link, Spinner, Text, VStack } from "@chakra-ui/react";
import NextImage from "next/image";
import { IoCopy } from "react-icons/io5";

interface SubmitKycApplicationDialogProps extends DialogRootProps {
    isProcessing?: boolean;
    sbtTokenId: string | null;
}
export function SubmitKycApplicationDialog(props: Partial<SubmitKycApplicationDialogProps>) {
    const { isProcessing, sbtTokenId, ...rest } = props;
    const getTitle = () => {
        if (sbtTokenId) {
            return `Xác minh thành công`;
        }

        return "Đang xác minh";
    };

    const getDescription = () => {
        if (sbtTokenId) {
            return "Xác minh thành công, hãy kiểm tra thông tin chi tiết ở bên dưới."
        }

        return "Đang xác minh KYC của bạn. Vui lòng đợi trong giây lát và không đóng trang này.";
    };

    const fields = [
        {
            label: "NFT",
            text: formatAddress(IDENTITY_SBT_CONTRACT_ADDRESS),
            value: IDENTITY_SBT_CONTRACT_ADDRESS,
            link: `${ETHEREUM_TESTNET_EXPLORER_URL}/address/${IDENTITY_SBT_CONTRACT_ADDRESS}`,
        },
        {
            label: "ID",
            value: sbtTokenId || "-",
            link: `${ETHEREUM_TESTNET_EXPLORER_URL}/nft/${IDENTITY_SBT_CONTRACT_ADDRESS}/${sbtTokenId}`,
        },
    ];

    return (
        <DialogRoot size={"md"} {...rest}>
            <DialogContent>
                <DialogHeader alignItems={"center"}>
                    <DialogTitle>
                        {getTitle()}
                    </DialogTitle>
                    {isProcessing && (
                        <Spinner size={"md"} />
                    )}
                </DialogHeader>
                <DialogBody>
                    <VStack gap={"4"}>
                        <Text w={"full"}>
                            {getDescription()}
                        </Text>
                        <Box bg={"bg.panel"} p={"4"} w={"full"} rounded={"2xl"} shadow={"md"}>
                            {sbtTokenId && (
                                <HStack w={"full"} justify={"space-between"} gap={"4"}>
                                    <For each={fields}>
                                        {({ label, value, link, text }) => (
                                            <Field
                                                orientation={"horizontal"}
                                                key={label}
                                                label={label}
                                                gap={"1"}
                                            >
                                                <Box flex={1} display={"flex"} justifyContent={"end"}>
                                                    <Link
                                                        w={"fit"}
                                                        href={link}
                                                        target="_blank"
                                                    >
                                                        {text || value}
                                                    </Link>
                                                </Box>
                                                <IconButton
                                                    variant={"plain"}
                                                    color={"fg.muted"}
                                                    size={"sm"}
                                                    aria-label={`Copy ${label}`}
                                                    transition={"all 0.3s ease-in-out"}
                                                    _active={{
                                                        transform: "scale(0.75)"
                                                    }}
                                                    _hover={{
                                                        color: "fg"
                                                    }}
                                                    onClick={async () => {
                                                        await navigator.clipboard.writeText(value!);
                                                        toaster.success({
                                                            title: "Đã sao chép",
                                                            description: `Sao chép ${label} thành công!`
                                                        });
                                                    }}
                                                >
                                                    <IoCopy />
                                                </IconButton>
                                            </Field>
                                        )}
                                    </For>
                                </HStack>
                            )}
                            {
                                isProcessing && (
                                    <Text color={"fg.muted"} fontSize={"sm"}>
                                        Thông tin sẽ được hiển thị sau khi xác minh thành công
                                    </Text>
                                )
                            }
                        </Box>
                        <Image asChild>
                            <NextImage
                                src={"/assets/poster-marketing-1.png"}
                                alt="Poster Marketing 1"
                                width={466}
                                height={173}
                            />
                        </Image>
                    </VStack>
                </DialogBody>
                <DialogFooter>
                    <Button
                        disabled={!sbtTokenId && isProcessing}
                        variant={"solid"} colorPalette={"fg"} onClick={() => { props.onOpenChange?.({ open: false }) }}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
}