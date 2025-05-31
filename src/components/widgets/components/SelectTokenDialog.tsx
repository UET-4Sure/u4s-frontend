import { Badge, Box, DialogRootProps, Flex, IconButton, VStack, Image, Text, Input, Spinner, HStack, DialogTrigger, Icon } from "@chakra-ui/react";
import { Token } from "../type";
import { LuSearch, LuStar } from "react-icons/lu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { HiMiniClipboardDocumentList } from "react-icons/hi2";
import { InputGroup } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { IoChevronDownOutline } from "react-icons/io5";

export interface TokenListConfig {
    showBalances?: boolean;
    showPrices?: boolean;
    showChainId?: boolean;
    enableSearch?: boolean;
    enableFavorites?: boolean;
    virtualScrolling?: boolean;
    itemHeight?: number;
    maxHeight?: string;
    popularTokensFirst?: boolean;
    groupByChain?: boolean;
}

interface SelectTokenDialogProps extends Omit<DialogRootProps, 'children'> {
    // Core props
    tokenList: Token[];
    selectedToken?: Token | null;
    onSelectToken: (token: Token) => void;

    // Customization
    title?: string;
    placeholder?: string;
    config?: TokenListConfig;

    // Filtering
    excludeTokens?: string[]; // addresses to exclude
    includeChains?: number[]; // only show these chains
    filterFn?: (token: Token, query: string) => boolean;

    // Loading & Empty states
    isLoading?: boolean;
    loadingText?: string;
    emptyText?: string;
    errorText?: string;

    // Advanced features
    onImportToken?: (address: string) => Promise<Token>;
    onToggleFavorite?: (token: Token) => void;
    favoriteTokens?: string[]; // token addresses

    // Event handlers
    onSearchChange?: (query: string) => void;
    onDialogClose?: () => void;

    // Render customization
    renderToken?: (token: Token, isSelected: boolean) => React.ReactNode;
    renderHeader?: () => React.ReactNode;
    renderEmptyState?: () => React.ReactNode;
}

const defaultConfig: TokenListConfig = {
    showBalances: true,
    showPrices: true,
    showChainId: false,
    enableSearch: true,
    enableFavorites: false,
    virtualScrolling: false,
    itemHeight: 72,
    maxHeight: '400px',
    popularTokensFirst: true,
    groupByChain: false,
};

interface TokenItemProps {
    token: Token;
    config: TokenListConfig;
    isFavorite?: boolean;
    onSelect: (token: Token) => void;
    onToggleFavorite?: (token: Token) => void;
    renderCustom?: (token: Token, isSelected: boolean) => React.ReactNode;
}

const TokenItem: React.FC<TokenItemProps> = ({
    token,
    config,
    isFavorite,
    onSelect,
    onToggleFavorite,
    renderCustom
}) => {
    if (renderCustom) {
        return <>{renderCustom(token, false)}</>;
    }

    return (
        <Flex
            p={3}
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
            _dark={{ _hover: { bg: 'gray.700' } }}
            onClick={() => onSelect(token)}
            align="center"
            gap={3}
        >
            {/* Token Logo */}
            <Box position="relative">
                {token.logoURI ? (
                    <Image
                        src={token.logoURI}
                        alt={token.symbol}
                        boxSize="40px"
                        borderRadius="full"
                    />
                ) : (
                    <Box
                        boxSize="40px"
                        borderRadius="full"
                        bg="gray.200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                        fontWeight="bold"
                    >
                        {token.symbol.slice(0, 2)}
                    </Box>
                )}

                {config.showChainId && token.chainId && (
                    <Badge
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        size="xs"
                        colorScheme="blue"
                    >
                        {token.chainId}
                    </Badge>
                )}
            </Box>

            {/* Token Info */}
            <Box flex="1" minW="0">
                <Flex align="center" gap={2}>
                    <Text fontWeight="semibold" fontSize="md">
                        {token.symbol}
                    </Text>
                </Flex>
                <Text color="gray.500" fontSize="sm">
                    {token.name}
                </Text>
            </Box>

            {/* Balance & Price */}
            <VStack align="end" gap={0}>
                {config.showBalances && token.balance && (
                    <Text fontSize="sm" fontWeight="medium">
                        {parseFloat(token.balance).toFixed(4)}
                    </Text>
                )}
                {config.showPrices && token.price && (
                    <Text fontSize="xs" color="gray.500">
                        ${parseFloat(token.price).toFixed(2)}
                    </Text>
                )}
            </VStack>

            {/* Favorite button */}
            {config.enableFavorites && onToggleFavorite && (
                <IconButton
                    aria-label="Toggle favorite"
                    size="sm"
                    variant="ghost"
                    color={isFavorite ? 'yellow.400' : 'gray.400'}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(token);
                    }}
                >
                    <LuStar />
                </IconButton>
            )}
        </Flex>
    );
};

interface VirtualListProps {
    items: Token[];
    itemHeight: number;
    maxHeight: string;
    renderItem: (token: Token, index: number) => React.ReactNode;
}

const VirtualList: React.FC<VirtualListProps> = ({
    items,
    itemHeight,
    maxHeight,
    renderItem
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.clientHeight);
        }
    }, []);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return (
        <Box
            ref={containerRef}
            height={maxHeight}
            overflow="auto"
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
            <Box height={`${totalHeight}px`} position="relative">
                <Box transform={`translateY(${offsetY}px)`}>
                    {visibleItems.map((item, index) => (
                        <Box key={item.address} height={`${itemHeight}px`}>
                            {renderItem(item, startIndex + index)}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export const SelectTokenDialog: React.FC<SelectTokenDialogProps> = ({
    tokenList,
    selectedToken,
    onSelectToken,
    title = "Select Token",
    placeholder = "Search by name or address",
    config: userConfig,
    excludeTokens = [],
    includeChains,
    filterFn,
    isLoading = false,
    loadingText = "Loading tokens...",
    emptyText = "No tokens found",
    errorText,
    onImportToken,
    onToggleFavorite,
    favoriteTokens = [],
    onSearchChange,
    onDialogClose,
    renderToken,
    renderHeader,
    renderEmptyState,
    ...dialogProps
}) => {
    const config = { ...defaultConfig, ...userConfig };
    const [searchQuery, setSearchQuery] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [open, setOpen] = useState(false)


    // Filter and sort tokens
    const filteredTokens = useMemo(() => {
        let filtered = tokenList.filter(token => {
            // Exclude tokens
            if (excludeTokens.includes(token.address.toLowerCase())) {
                return false;
            }

            // Chain filter
            if (includeChains && token.chainId && !includeChains.includes(token.chainId)) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                if (filterFn) {
                    return filterFn(token, searchQuery);
                }

                const query = searchQuery.toLowerCase();
                return (
                    token.symbol.toLowerCase().includes(query) ||
                    token.name.toLowerCase().includes(query) ||
                    token.address.toLowerCase().includes(query)
                );
            }

            return true;
        });

        // Sort tokens
        filtered.sort((a, b) => {
            // Favorites first
            if (config.enableFavorites) {
                const aIsFav = favoriteTokens.includes(a.address);
                const bIsFav = favoriteTokens.includes(b.address);
                if (aIsFav && !bIsFav) return -1;
                if (!aIsFav && bIsFav) return 1;
            }

            // Sort by balance (higher first)
            if (config.showBalances && a.balance && b.balance) {
                const balanceA = parseFloat(a.balance);
                const balanceB = parseFloat(b.balance);
                if (balanceA !== balanceB) {
                    return balanceB - balanceA;
                }
            }

            // Sort alphabetically
            return a.symbol.localeCompare(b.symbol);
        });

        return filtered;
    }, [tokenList, searchQuery, excludeTokens, includeChains, filterFn, config, favoriteTokens]);

    // Handle search
    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        onSearchChange?.(value);
    }, [onSearchChange]);

    const handleSelectToken = useCallback((token: Token) => {
        onSelectToken(token);
        setSearchQuery(''); // Clear search after selection
        setOpen(false); // Close dialog after selection
    }, [onSelectToken]);
    // Handle token import
    const handleImportToken = useCallback(async () => {
        if (!onImportToken || !searchQuery) return;

        try {
            setIsImporting(true);
            const token = await onImportToken(searchQuery);
            onSelectToken(token);
        } catch (error) {
            console.error('Failed to import token:', error);
        } finally {
            setIsImporting(false);
        }
    }, [onImportToken, searchQuery, onSelectToken]);

    // Check if search query looks like an address
    const isAddressQuery = searchQuery.length === 42 && searchQuery.startsWith('0x');
    const showImportOption = onImportToken && isAddressQuery && filteredTokens.length === 0;

    return (
        <DialogRoot size="md" open={open} onOpenChange={(e) => setOpen(e.open)} {...dialogProps}>
            <DialogTrigger asChild>
                {
                    selectedToken ?
                        <Button>
                            <Image
                                src={selectedToken.logoURI || ''}
                                alt={selectedToken.symbol}
                                rounded={"full"}
                            />
                            {title}
                            <Icon as={IoChevronDownOutline} />
                        </Button>
                        :
                        <Button>
                            {title}
                            <Icon as={IoChevronDownOutline} />
                        </Button>
                }
            </DialogTrigger>
            <DialogBackdrop />
            <DialogContent>
                {/* Header */}
                <DialogHeader>
                    <DialogTitle>Select Token</DialogTitle>
                    <DialogCloseTrigger
                        onClick={onDialogClose}
                        asChild
                    >
                        <IconButton
                            aria-label="Close dialog"
                            size="sm"
                            variant="ghost"
                        >
                            <HiMiniClipboardDocumentList />
                        </IconButton>
                    </DialogCloseTrigger>
                </DialogHeader>

                <DialogBody>
                    {/* Custom header */}
                    {renderHeader && renderHeader()}

                    {/* Search input */}
                    {config.enableSearch && (
                        <InputGroup mb={4} startElement={<LuSearch />}>
                            <Input
                                placeholder={placeholder}
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </InputGroup>
                    )}

                    {/* Content */}
                    {isLoading ? (
                        <Flex justify="center" align="center" py={8}>
                            <VStack>
                                <Spinner />
                                <Text color="gray.500">{loadingText}</Text>
                            </VStack>
                        </Flex>
                    ) : errorText ? (
                        <Flex justify="center" align="center" py={8}>
                            <Text color="red.500">{errorText}</Text>
                        </Flex>
                    ) : filteredTokens.length === 0 ? (
                        <>
                            {showImportOption ? (
                                <Flex justify="center" align="center" py={8}>
                                    <VStack>
                                        <Text color="gray.500">Token not found</Text>
                                        <Box
                                            as="button"
                                            onClick={handleImportToken}
                                            p={3}
                                            border="1px dashed"
                                            borderColor="gray.300"
                                            borderRadius="md"
                                            _hover={{ borderColor: 'blue.400' }}
                                        >
                                            {isImporting ? (
                                                <HStack>
                                                    <Spinner size="sm" />
                                                    <Text>Importing...</Text>
                                                </HStack>
                                            ) : (
                                                <Text color="blue.500">
                                                    Import token: {searchQuery}
                                                </Text>
                                            )}
                                        </Box>
                                    </VStack>
                                </Flex>
                            ) : renderEmptyState ? (
                                renderEmptyState()
                            ) : (
                                <Flex justify="center" align="center" py={8}>
                                    <Text color="gray.500">{emptyText}</Text>
                                </Flex>
                            )}
                        </>
                    ) : (
                        /* Token list */
                        <Box>
                            {config.virtualScrolling ? (
                                <VirtualList
                                    items={filteredTokens}
                                    itemHeight={config.itemHeight!}
                                    maxHeight={config.maxHeight!}
                                    renderItem={(token) => (
                                        <TokenItem
                                            key={token.address}
                                            token={token}
                                            config={config}
                                            isFavorite={favoriteTokens.includes(token.address)}
                                            onSelect={handleSelectToken}
                                            onToggleFavorite={onToggleFavorite}
                                            renderCustom={renderToken}
                                        />
                                    )}
                                />
                            ) : (
                                <Box maxH={config.maxHeight} overflowY="auto">
                                    {filteredTokens.map((token) => (
                                        <TokenItem
                                            key={token.address}
                                            token={token}
                                            config={config}
                                            isFavorite={favoriteTokens.includes(token.address)}
                                            onSelect={onSelectToken}
                                            onToggleFavorite={onToggleFavorite}
                                            renderCustom={renderToken}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    );
};
