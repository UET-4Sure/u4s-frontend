import { Button } from "@/components/ui/button";
import { DialogContent, DialogRoot, DialogHeader, DialogBody, DialogTitle, DialogCloseTrigger } from "@/components/ui/dialog";
import { DialogFooter, DialogRootProps, Heading, Image, Spinner, Text, VStack } from "@chakra-ui/react";
import NextImage from "next/image";
import NextLink from "next/link";
import { useState } from "react";

interface RequireKycApplicationDialogProps extends DialogRootProps {

}
export function RequireKycApplicationDialog(props: Partial<RequireKycApplicationDialogProps>) {

    return (
        <DialogRoot size={"md"}  {...props}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Yêu cầu xác minh danh tính
                    </DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <VStack gap={"4"}>
                        <Image asChild
                            pointerEvents={"none"}
                            w={"75%"}
                        >
                            <NextImage
                                src="/assets/logo-id-card.svg"
                                alt="Logo ID Card"
                                width={192}
                                height={128}
                            />
                        </Image>
                        <Text>
                            Với các giao dịch lớn trên <b>10,000 USD</b> cần hoàn thành xác minh để đảm bảo an toàn và tuân thủ quy định.
                        </Text>
                    </VStack>
                </DialogBody>
                <DialogFooter>
                    <DialogCloseTrigger asChild>
                        <Button variant={"outline"}>
                            Quay lại
                        </Button>
                    </DialogCloseTrigger>
                    <Button asChild>
                        <NextLink href={"/kyc"}>
                            Xác minh ngay
                        </NextLink>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
}