import { useQuery } from "@tanstack/react-query";
import { alchemy } from "@/config/alchemy";
import { OwnedNftsResponse, OwnedNft } from "alchemy-sdk";
import { getPositionInfo } from "@/script/QueryPositionInfo";
import { TOKEN_ADDRESSES } from "@/app/(dashboard)/(trade)/swap/constants";

const POSITION_NFT_ADDRESS = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";

// Default pool key for the main pool
const DEFAULT_POOL_KEY = {
    currency0: TOKEN_ADDRESSES.WETH,
    currency1: TOKEN_ADDRESSES.USDC,
    fee: 500,
    tickSpacing: 10,
    hooks: "0x0000000000000000000000000000000000000000"
};

interface Position {
    tokenId: string;
    contractAddress: string;
    metadata?: {
        title: string;
        description: string;
        mediaUrl: string;
    };
}

export function usePositions(address?: string) {
    const fetchPositions = async (): Promise<Position[]> => {
        if (!address) return [];

        const allNfts: Position[] = [];
        let pageKey: string | undefined = undefined;

        do {
            const resp: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address, {
                contractAddresses: [POSITION_NFT_ADDRESS],
                pageKey,
            });

            // Process each NFT and fetch its position metadata
            for (const nft of resp.ownedNfts) {
                try {
                    allNfts.push({
                        tokenId: nft.tokenId,
                        contractAddress: nft.contract.address,
                        metadata: {
                            title: nft.name || "",
                            description: nft.description || "",
                            mediaUrl: nft.image.pngUrl || "",
                        }
                    });
                } catch (posError) {
                    console.error(`Error fetching metadata for position ${nft.tokenId}:`, posError);
                    // Still add the NFT even if metadata fetch fails
                    allNfts.push({
                        tokenId: nft.tokenId,
                        contractAddress: nft.contract.address
                    });
                }
            }

            pageKey = resp.pageKey;
        } while (pageKey);

        return allNfts;
    };

    return useQuery({
        queryKey: ['positions', address],
        queryFn: fetchPositions,
        enabled: !!address,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
} 