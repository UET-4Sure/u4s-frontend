import { useEffect, useState } from "react";
import { alchemy } from "@/config/alchemy";
import { OwnedNftsResponse } from "alchemy-sdk";

const POSITION_NFT_ADDRESS = "0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4";

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
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPositions = async () => {
            if (!address) return;
            setLoading(true);
            setError(null);

            try {
                const allNfts: Position[] = [];
                let pageKey: string | undefined = undefined;

                do {
                    const resp: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(address, {
                        contractAddresses: [POSITION_NFT_ADDRESS],
                        pageKey,
                    });

                    for (const nft of resp.ownedNfts) {
                        allNfts.push({
                            tokenId: nft.tokenId,
                            contractAddress: nft.contract.address,
                            metadata: {
                                title: nft.name || "",
                                description: nft.description || "",
                                mediaUrl: nft.image.pngUrl || "",
                            }
                        });
                    }

                    pageKey = resp.pageKey;
                } while (pageKey);

                setPositions(allNfts);
            } catch (err) {
                console.error("Error fetching positions:", err);
                setError("Failed to fetch positions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, [address]);

    return { positions, loading, error };
} 