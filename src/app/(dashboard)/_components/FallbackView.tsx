import { Center, CenterProps, VStack, Text } from "@chakra-ui/react";

interface FallbackViewProps extends CenterProps {
    label?: React.ReactNode;
    subtitle?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
}
export const FallbackView: React.FC<FallbackViewProps> = ({
    label,
    subtitle,
    description,
    icon,
    ...props
}) => {
    return (
        <Center w={"full"} h={"full"} {...props}>
            <VStack>
                {label
                    &&
                    (<Text fontSize="2xl" fontWeight="bold">
                        {label}
                    </Text>
                    )
                }
                {
                    subtitle
                    &&
                    <Text fontSize="md" color="fg.muted">
                        {subtitle}
                    </Text>
                }
                {
                    description
                    &&
                    <Text fontSize="sm" color="fg.subtle">
                        {description}
                    </Text>
                }
                {icon && icon}
            </VStack>
        </Center>
    );
};