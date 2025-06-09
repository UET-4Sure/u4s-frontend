import { StackProps, VStack } from "@chakra-ui/react";

interface Props extends StackProps {

}
export const PersonalArea: React.FC<Props> = ({ children, ...props }) => {
    return (
        <VStack {...props}>
            {children}
        </VStack>
    );
};