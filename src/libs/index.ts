export function formatAddress(address?: string, chars = 4) {
    if (!address) return null;
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}