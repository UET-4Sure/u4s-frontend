import { Button, ButtonProps } from "@chakra-ui/react";

interface Props extends ButtonProps { }
export const SignInButton: React.FC<Props> = (props) => {
    return (
        <Button
            {...props}
        >
            Sign In
        </Button>
    );
};