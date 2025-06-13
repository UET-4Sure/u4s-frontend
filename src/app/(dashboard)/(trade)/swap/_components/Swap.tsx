import { SwapWidget } from "@/components/widgets/swap/Swap";
import { StackProps } from "@chakra-ui/react";

interface Props extends StackProps {}
export const Swap: React.FC<Props> = ({ children, ...props }) => {
    return (
        <SwapWidget
            
        />
    );
};