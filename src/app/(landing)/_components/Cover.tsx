"use client";

import { Center, HtmlProps, Image } from "@chakra-ui/react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

interface Props extends HtmlProps {
}

export const Cover: React.FC<Props> = (props) => {
    const { scrollY } = useScroll();
    const [scrollYProgress, setScrollYProgress] = useState(25);
    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrollYProgress(latest * 0.025 + 25);
    })

    return (
        <Center
            position={"fixed"}
            width={"svw"}
            height={"svh"}
            pointerEvents={"none"}
            zIndex={-1}
            {...props}
        >
            {/* <Image
                width={"100%"}
                asChild
            >
                <NextImage
                    src="/assets/poster-landing.png"
                    alt="Cover Image"
                    width={1830}
                    height={878}
                    priority
                />
            </Image> */}
            <Image
                position={"absolute"}
                height={"svh"}
                aspectRatio={1 / 1}
                left={-scrollYProgress + "svw"}
                asChild
            >
                <NextImage
                    src="/assets/bg-cover-halongbay.png"
                    alt="Cover Image"
                    width={1280}
                    height={853}
                    priority
                />
            </Image>
            <Image
                position={"absolute"}
                height={"svh"}
                right={-scrollYProgress + 25 + "svw"}
                aspectRatio={1 / 1}
                asChild
            >
                <NextImage
                    src="/assets/bg-cover-onepillarpagoda.png"
                    alt="Cover Image"
                    width={512}
                    height={512}
                    priority
                />
            </Image>
        </Center>
    );
}