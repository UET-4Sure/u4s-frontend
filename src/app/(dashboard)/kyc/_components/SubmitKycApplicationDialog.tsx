import { DialogContent, DialogRoot, DialogHeader, DialogBody, DialogTitle } from "@/components/ui/dialog";
import { DialogRootProps, Heading, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import NextImage from "next/image";

interface SubmitKycApplicationDialogProps extends DialogRootProps {
    isProcessing?: boolean;
    sbtTokenId?: string;
}
export function SubmitKycApplicationDialog(props: Partial<SubmitKycApplicationDialogProps>) {
    const { open, isProcessing, sbtTokenId, ...rest } = props;
    const getTitle = () => {
        if (isProcessing) {
            return "Đang gửi đơn";
        }

        if (sbtTokenId) {
            return `Xác minh thành công`;
        }

        return "Đang xác minh";
    };

    const getDescription = () => {
        if (isProcessing) {
            return "Đang gửi đơn KYC của bạn. Vui lòng đợi trong giây lát và không đóng trình duyệt.";
        }

        if (sbtTokenId) {
            return "KYC của bạn đã được xác minh thành công. ID NFT sẽ được gửi đến ví của bạn.";
        }

        return "Đang xác minh KYC của bạn. Vui lòng đợi trong giây lát.";
    };

    return (
        <DialogRoot size={"md"} open={open} {...rest}>
            <DialogContent>
                <DialogHeader alignItems={"center"}>
                    <DialogTitle>
                        {getTitle()}
                    </DialogTitle>
                    <Spinner size={"md"} />
                </DialogHeader>
                <DialogBody>
                    <VStack gap={"4"}>
                        <Text>
                            {getDescription()}
                        </Text>
                        <Image asChild>
                            <NextImage
                                src={"/assets/poster-marketing-1.png"}
                                alt="Poster Marketing 1"
                                width={466}
                                height={173}
                            />
                        </Image>
                        {sbtTokenId && (
                            <Text>
                                ID NFT của bạn: <b>{sbtTokenId}</b>
                                <br />
                                Bạn có thể xem NFT này trong ví của mình.
                            </Text>
                        )}
                    </VStack>
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    );
}