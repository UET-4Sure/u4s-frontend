import { config } from 'dotenv'
config();

import { TOKEN_ADDRESSES } from '@/app/(dashboard)/(trade)/swap/config'
import { ethers } from 'ethers'
import ERC20_ABI from '@/abis/ERC20.json'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";

export async function queryBalance(tokenAddress: string, userAddress: string) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const tokenContract = new ethers.Contract(
            tokenAddress,
            ERC20_ABI.abi,
            provider
        );
        
        // Get balance
        const balance = await tokenContract.balanceOf(userAddress);
        
        // Format with correct decimals
        return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
        console.error('Error querying balance:', error);
        return "0";
    }
}

// // Example usage
// async function main() {
//     try {
//         const balance = await queryBalance(
//             TOKEN_ADDRESSES.USDC,
//             "0x2Bd7ff87647DFC43CFfE719D589e5eDcFFc751f1" 
//         );
//         console.log("USDC Balance:", balance);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// main();