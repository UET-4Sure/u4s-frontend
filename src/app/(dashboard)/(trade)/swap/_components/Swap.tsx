import { SwapWidget } from "@/components/widgets/swap/Swap";
import { StackProps } from "@chakra-ui/react";
import { useWriteContract } from "wagmi";

interface Props extends StackProps { }
export const Swap: React.FC<Props> = ({ children, ...props }) => {
    const { data, writeContract, isPending } = useWriteContract()

    return (
        <SwapWidget
            onSwap={async (swapData) =>{
                writeContract({
                    address: "0xYourContractAddressHere", // Replace with your contract address
                    abi: [
                        // Replace with your contract ABI
                        {
                            "inputs": [
                                { "internalType": "address", "name": "fromToken", "type": "address" },
                                { "internalType": "address", "name": "toToken", "type": "address" },
                                { "internalType": "uint256", "name": "amount", "type": "uint256" }
                            ],
                            "name": "swap",
                            "outputs": [],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        }
                    ],
                    functionName: "swap",
                    args: [
                        swapData.fromToken?.address as `0x${string}`,
                        swapData.toToken?.address as `0x${string}`,
                        BigInt(swapData.fromAmount),
                    ],
                })
            }}
        />
    );
};