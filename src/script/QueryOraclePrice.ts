import { config } from 'dotenv'
config();

import { TOKEN_ADDRESSES } from '@/app/(dashboard)/(trade)/swap/constants'
import { ethers } from 'ethers'
import ERC20_ABI from '@/abis/ERC20.json'
import CHAINLINK_PRICE_FEED_ABI from '@/abis/ChainlinkPriceFeed'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "";


const PRICE_FEED_ADDRESSES: { [key: string]: string } = {
    "0x342d6127609A5Ad63C93E10cb73b7d9dE9bC43Aa": "0x694AA1769357215DE4FAC081bf1f309aDC325306", // WETH/USD
    "0x0ff5065E79c051c3D4C790BC9e8ebc9b4E56bbcc": "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E", // USDC/USD
    "0x12Df3798C30532c068306372d24c9f2f451676e9": "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", // BTC/USD
    "0x88B42E9E9E769F86ab499D8cb111fcb6f691F70E": "0xc59E3633BAAC79493d908e63626716e204A45EdF", // LINK/USD
    "0x336d87aEdF99d5Fb4F07132C8DbE4bea4c766eAc": "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910", // EUR/USD
};

export async function queryOraclePrice(tokenAddress: string): Promise<string> {
    try {
        // Get the price feed address for the token
        const priceFeedAddress = PRICE_FEED_ADDRESSES[tokenAddress];
        if (!priceFeedAddress) {
            console.error('No price feed found for token:', tokenAddress);
            return "0";
        }

        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const priceFeed = new ethers.Contract(
            priceFeedAddress,
            CHAINLINK_PRICE_FEED_ABI,
            provider
        );

        // Get the price feed decimals
        const decimals = await priceFeed.decimals();

        // Get the latest round data
        const roundData = await priceFeed.latestRoundData();
        
        // Format the price with the correct number of decimals
        const price = ethers.utils.formatUnits(roundData.answer, decimals);
        
        console.log('Oracle price fetched:', {
            token: tokenAddress,
            price,
            timestamp: new Date(Number(roundData.updatedAt) * 1000).toISOString()
        });

        return price;
    } catch (error) {
        console.error('Error querying oracle price:', error);
        return "0";
    }
}

// Example usage
// async function main() {
//     try {
//         const price = await queryOraclePrice(TOKEN_ADDRESSES.WETH);
//         console.log("WETH Price:", price);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// }

// main();