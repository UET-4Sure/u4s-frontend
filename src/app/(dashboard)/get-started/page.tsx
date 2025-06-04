"use client"

import {
    Center,
    Heading,
    HStack,
    Text,
    VStack,
} from "@chakra-ui/react"
import NextImage from "next/image"
import { motion } from "framer-motion"

const MotionVStack = motion(VStack)
const MotionImage = motion(NextImage)
const MotionText = motion(Text)

const AuthOptionCard = ({ label, logoSrc, children }: {
    label: string
    logoSrc: string
    children?: React.ReactNode
}) => {
    return (
        <MotionVStack
            align="center"
            whileHover="hover"
            initial="rest"
            animate="rest"
            w="120px"
            h="140px"
            justify="center"
            position="relative"
            _hover={{
                cursor: "pointer",
            }}
        >
            <MotionImage
                src={logoSrc}
                alt={`${label} logo`}
                width={48}
                height={48}
                variants={{
                    rest: { scale: 1, y: 0 },
                    hover: { scale: 1.4, y: -20 },
                }}
                transition={{ type: "spring", stiffness: 300 }}
            />

            <MotionText
                fontWeight="medium"
                fontSize="sm"
                variants={{
                    rest: { opacity: 0, y: 10 },
                    hover: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
            >
                {label}
            </MotionText>

            {children}
        </MotionVStack>
    )
}

export default function GetStartedPage() {
    const supportAuthenticator = [
        {
            label: "Google",
            logoSrc: "/assets/logo-google.svg",
            authenticator: "google",
        },
        {
            label: "Facebook",
            logoSrc: "/assets/logo-facebook.svg",
            authenticator: "facebook",
        },
    ]

    const connectWallet = {
        label: "Connect Wallet",
        logoSrc: "/assets/logo-connect-wallet.svg",
    }

    return (
        <Center w={"full"} h={"full"}>
            <VStack>
                <VStack p={"8"}>
                    <Heading>Đăng nhập</Heading>
                    <Text>Chọn phương thức đăng nhập</Text>
                </VStack>
                <HStack gap={"8"}>

                </HStack>
            </VStack>
        </Center>
    )
}