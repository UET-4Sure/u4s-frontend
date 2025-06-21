import { HtmlProps } from "@chakra-ui/react";

interface Props extends HtmlProps {}

export const Cover: React.FC<Props> = (props) => {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url('/images/landing/cover.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
            {...props}
        />
    );
}