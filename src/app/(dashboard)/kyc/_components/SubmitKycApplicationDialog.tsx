import { DialogContent, DialogRoot, DialogHeader, DialogBody, DialogTitle } from "@/components/ui/dialog";
import { DialogRootProps, Heading, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import NextImage from "next/image";

interface SubmitKycApplicationDialogProps extends DialogRootProps {

}
export function SubmitKycApplicationDialog(props: Partial<SubmitKycApplicationDialogProps>) {
    const { open, ...rest } = props;

    return (
        <DialogRoot size={"md"} open={open} {...rest}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Đang xác minh
                    </DialogTitle>
                    <Spinner size={"md"}/>
                </DialogHeader>
                <DialogBody>
                    <VStack gap={"4"}>
                        
                        <Text>
                            Quá trình KYC đang được hoàn tất. ID NFT sẽ được gửi đến ví của bạn. Vui lòng chờ trong giây lát.
                        </Text>
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
            </DialogContent>
        </DialogRoot>
    );
}