import { Badge, Box, DialogRootProps, Flex, IconButton, VStack, Text, Input, Spinner, HStack, DialogTrigger, Icon, AvatarRoot, AvatarImage, AvatarFallback, Center, CenterProps } from "@chakra-ui/react";
import { LuSearch, LuStar } from "react-icons/lu";
import { useCallback, useMemo, useState } from "react";
import { DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { IoChevronDownOutline } from "react-icons/io5";
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

import { Button, ButtonProps } from "@/components/ui/button";
import { InputGroup } from "@/components/ui/input-group";

import { Token } from "../type";

export interface TokenListConfig {
    showBalances?: boolean;
    showPrices?: boolean;
    showChainId?: boolean;
    enableSearch?: boolean;
    enableFavorites?: boolean;
    virtualScrolling?: boolean;
    itemHeight?: number;
    maxHeight: number;
    popularTokensFirst?: boolean;
    groupByChain?: boolean;
}

export interface SelectTokenDialogProps extends Omit<DialogRootProps, 'children'> {
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

    // Dialog props
    triggerProps?: ButtonProps;
}

const defaultConfig: TokenListConfig = {
    showBalances: true,
    showPrices: true,
    showChainId: false,
    enableSearch: true,
    enableFavorites: false,
    virtualScrolling: false,
    itemHeight: 72,
    maxHeight: 512,
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
            p={"2"}
            rounded={"2xl"}
            cursor="pointer"
            _hover={{ bg: 'bg.emphasized' }}
            align="center"
            gap={"4"}
            onClick={() => onSelect(token)}
        >
            <Box position="relative">
                <AvatarRoot shadow={"sm"}>
                    <AvatarImage
                        src={token.logoURI}
                        alt={token.symbol}
                    />
                    <AvatarFallback name={token.symbol} />
                </AvatarRoot>

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

            <Box flex="1" minW="0">
                <Flex align="center" gap={2}>
                    <Text fontWeight="semibold" fontSize="md">
                        {token.name}
                    </Text>
                </Flex>
                <Text color="fg.muted" fontWeight={"medium"} fontSize="sm">
                    {token.symbol}
                </Text>
            </Box>

            <VStack align="end" gap={0}>
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

interface VirtualListProps extends CenterProps {
    items: Token[];
    itemHeight: number;
    maxHeight: number;
    renderItem: (token: Token, index: number) => React.ReactNode;
}

export function VirtualList({ items, itemHeight, maxHeight, renderItem, ...props }: VirtualListProps) {

    // Component render từng dòng
    const Row = ({ index, style }: ListChildComponentProps) => {
        const item = items[index];
        return (
            <Box style={style} key={item.address} height={itemHeight}>
                {renderItem(item, index)}
            </Box>
        );
    };

    return (
        <Center height={maxHeight} overflow="auto" w="full" {...props}>
            <List
                direction="vertical"
                height={maxHeight}
                itemCount={items.length}
                itemSize={itemHeight}
                width="100%"
            >
                {Row}
            </List>
        </Center>
    );
}
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

    triggerProps,
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

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        onSearchChange?.(value);
    }, [onSearchChange]);

    const handleSelectToken = useCallback((token: Token) => {
        onSelectToken(token);
        setSearchQuery('');
        setOpen(false);
    }, [onSelectToken]);

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

    const handleCloseDialog = useCallback(() => {
        setOpen(false);
        setSearchQuery('');
        onDialogClose?.();
    }, [onDialogClose]);

    // Check if search query looks like an address
    const isAddressQuery = searchQuery.length === 42 && searchQuery.startsWith('0x');
    const showImportOption = onImportToken && isAddressQuery && filteredTokens.length === 0;

    return (
        <DialogRoot
            size="md"
            open={open}
            lazyMount
            onOpenChange={(e) => setOpen(e.open)}
            {...dialogProps}
        >
            <DialogTrigger asChild>
                {
                    selectedToken ?
                        <Button p={"1"} h={"fit"} w={"fit"} shadow={"md"} {...triggerProps}>
                            <AvatarRoot size={"xs"} shadow={"sm"}>
                                <AvatarImage
                                    src={selectedToken.logoURI}
                                    alt={selectedToken.symbol}
                                />
                                <AvatarFallback name={selectedToken.symbol} />
                            </AvatarRoot>
                            {title}
                            <Icon as={IoChevronDownOutline} />
                        </Button>
                        :
                        <Button {...triggerProps}>
                            {title}
                            <Icon as={IoChevronDownOutline} />
                        </Button>
                }
            </DialogTrigger>
            <DialogBackdrop />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Token</DialogTitle>
                    <DialogCloseTrigger
                        onClick={handleCloseDialog}
                    />
                </DialogHeader>

                <DialogBody>
                    {/* Custom header */}
                    {renderHeader && renderHeader()}
                    <VStack w={"full"} h={"full"} gap={"4"}>
                        {/* Search input */}
                        {config.enableSearch && (
                            <InputGroup w={"full"} startElement={<LuSearch />}>
                                <Input
                                    variant={"subtle"}
                                    rounded={"full"}
                                    placeholder={placeholder}
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </InputGroup>
                        )}

                        {/* Content */}
                        {isLoading ? (
                            <Flex justify="center" align="center" w={"full"}>
                                <VStack>
                                    <Spinner />
                                    <Text color="gray.500">{loadingText}</Text>
                                </VStack>
                            </Flex>
                        ) : errorText ? (
                            <Flex justify="center" align="center" w={"full"}>
                                <Text color="red.500">{errorText}</Text>
                            </Flex>
                        ) : filteredTokens.length === 0 ? (
                            <>
                                {showImportOption ? (
                                    <Flex justify="center" align="center" w={"full"}>
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
                                    <Flex justify="center" align="center" w={"full"}>
                                        <Text color="gray.500">{emptyText}</Text>
                                    </Flex>
                                )}
                            </>
                        ) :
                            <VirtualList
                                w={"full"}
                                items={filteredTokens}
                                itemHeight={config.itemHeight!}
                                maxHeight={config.maxHeight}
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
                        }
                    </VStack>
                </DialogBody>
            </DialogContent>
        </DialogRoot>
    );
};
