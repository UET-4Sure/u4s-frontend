"use client";

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import CountUp from 'react-countup';
import { quoteAmmPrice } from '@/script/QuoteAmountOut';
import {
  USDC_WETH_CONFIG,
  USDC_WBTC_CONFIG,
  USDC_LINK_CONFIG,
  USDC_EUR_CONFIG,
  WBTC_WETH_CONFIG,
  WETH_LINK_CONFIG,
  EUR_WETH_CONFIG,
  WBTC_LINK_CONFIG,
  WBTC_EUR_CONFIG,
  EUR_LINK_CONFIG,
} from '@/app/(dashboard)/(trade)/swap/poolConfig';
import { TOKEN_LIST } from '@/app/(dashboard)/(trade)/swap/config';
import {
  Box,
  VStack,
  HStack,
  Text,
  chakra,
} from '@chakra-ui/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip } from '@/components/ui/tooltip';
import { Tag } from '@/components/ui/tag';
import { DataListRoot, DataListItem } from '@/components/ui/data-list';
import numeral from 'numeral';
import { calculateVolumeLiquidity } from '@/app/(dashboard)/(pool)/positions/create/_components/utils';
import { queryBalance } from '@/script/QueryBalance';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

const MotionBox = motion.create(Box);

interface PoolInfo {
  name: string;
  fee: string;
  tvl: string;
  tvlNumber: number;
  price: number;
  token0: string;
  token1: string;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoURI?: string;
  token1LogoURI?: string;
}

const POOL_MANAGER_ADDRESS = "0xE03A1074c86CFeDd5C142C4F04F1a1536e203543";

export default function PoolList() {
  const router = useRouter();

  const fetchPoolData = async () => {
    const getTokenInfo = (symbol: string) => {
      return TOKEN_LIST.find(token => token.symbol === symbol);
    };

    const poolConfigs = [
      {
        config: USDC_WETH_CONFIG,
        name: 'USDC-WETH',
        token0Symbol: 'USDC',
        token1Symbol: 'WETH',
        token0LogoURI: getTokenInfo('USDC')?.logoURI,
        token1LogoURI: getTokenInfo('WETH')?.logoURI
      },
      {
        config: USDC_WBTC_CONFIG,
        name: 'USDC-WBTC',
        token0Symbol: 'USDC',
        token1Symbol: 'WBTC',
        token0LogoURI: getTokenInfo('USDC')?.logoURI,
        token1LogoURI: getTokenInfo('WBTC')?.logoURI
      },
      {
        config: USDC_LINK_CONFIG,
        name: 'USDC-LINK',
        token0Symbol: 'USDC',
        token1Symbol: 'LINK',
        token0LogoURI: getTokenInfo('USDC')?.logoURI,
        token1LogoURI: getTokenInfo('LINK')?.logoURI
      },
      {
        config: USDC_EUR_CONFIG,
        name: 'USDC-EUR',
        token0Symbol: 'USDC',
        token1Symbol: 'EUR',
        token0LogoURI: getTokenInfo('USDC')?.logoURI,
        token1LogoURI: getTokenInfo('EUR')?.logoURI
      },
      {
        config: WBTC_WETH_CONFIG,
        name: 'WBTC-WETH',
        token0Symbol: 'WBTC',
        token1Symbol: 'WETH',
        token0LogoURI: getTokenInfo('WBTC')?.logoURI,
        token1LogoURI: getTokenInfo('WETH')?.logoURI
      },
      {
        config: WETH_LINK_CONFIG,
        name: 'WETH-LINK',
        token0Symbol: 'WETH',
        token1Symbol: 'LINK',
        token0LogoURI: getTokenInfo('WETH')?.logoURI,
        token1LogoURI: getTokenInfo('LINK')?.logoURI
      },
      {
        config: EUR_WETH_CONFIG,
        name: 'EUR-WETH',
        token0Symbol: 'EUR',
        token1Symbol: 'WETH',
        token0LogoURI: getTokenInfo('EUR')?.logoURI,
        token1LogoURI: getTokenInfo('WETH')?.logoURI
      },
      {
        config: WBTC_LINK_CONFIG,
        name: 'WBTC-LINK',
        token0Symbol: 'WBTC',
        token1Symbol: 'LINK',
        token0LogoURI: getTokenInfo('WBTC')?.logoURI,
        token1LogoURI: getTokenInfo('LINK')?.logoURI
      },
      {
        config: WBTC_EUR_CONFIG,
        name: 'WBTC-EUR',
        token0Symbol: 'WBTC',
        token1Symbol: 'EUR',
        token0LogoURI: getTokenInfo('WBTC')?.logoURI,
        token1LogoURI: getTokenInfo('EUR')?.logoURI
      },
      {
        config: EUR_LINK_CONFIG,
        name: 'EUR-LINK',
        token0Symbol: 'EUR',
        token1Symbol: 'LINK',
        token0LogoURI: getTokenInfo('EUR')?.logoURI,
        token1LogoURI: getTokenInfo('LINK')?.logoURI
      },
    ];

    const poolsWithPrices = await Promise.all(
      poolConfigs.map(async ({ config, name, token0Symbol, token1Symbol, token0LogoURI, token1LogoURI }) => {
        let price = 0;
        let tvl = '$0';
        let tvlNumber = 0;

        try {
          price = await quoteAmmPrice(
            config.poolKey.currency0,
            config.poolKey.currency1,
            1
          );

          // Get balances
          const balance0 = Number(await queryBalance(config.poolKey.currency0, POOL_MANAGER_ADDRESS));
          const balance1 = Number(await queryBalance(config.poolKey.currency1, POOL_MANAGER_ADDRESS));

          // Calculate TVL
          tvlNumber = await calculateVolumeLiquidity(
            config.poolKey.currency0,
            balance0,
            config.poolKey.currency1,
            balance1
          );

          tvl = `$${numeral(tvlNumber).format('0,0.00')}`;
        } catch (error) {
          console.error(`Error fetching data for ${name}:`, error);
        }

        return {
          name,
          fee: '0.3%',
          tvl,
          tvlNumber,
          price,
          token0: config.poolKey.currency0,
          token1: config.poolKey.currency1,
          token0Symbol,
          token1Symbol,
          token0LogoURI,
          token1LogoURI,
        };
      })
    );

    // Calculate total TVL
    const totalTVL = poolsWithPrices.reduce((sum, pool) => sum + pool.tvlNumber, 0);

    return { pools: poolsWithPrices, totalTVL };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['pool-list'],
    queryFn: fetchPoolData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const pools = data?.pools || [];
  const totalTVL = data?.totalTVL || 0;

  if (isLoading) {
    return (
      <VStack gap={6} width="full">
        <Box w="full" bg="bg.subtle" p={6} rounded="2xl" shadow="md">
          <VStack align="start" gap={2}>
            <Skeleton height="6" width="200px" />
            <Skeleton height="10" width="150px" />
          </VStack>
        </Box>

        {Array.from({ length: 5 }).map((_, index) => (
          <Box
            key={index}
            w="full"
            bg="bg.subtle"
            p={4}
            rounded="2xl"
            shadow="md"
          >
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <HStack gap={2}>
                  <Skeleton height="6" width="6" rounded="full" />
                  <Skeleton height="6" width="120px" />
                  <Skeleton height="6" width="50px" />
                </HStack>
                <HStack gap={2}>
                  <Skeleton height="8" width="60px" />
                  <Skeleton height="8" width="100px" />
                </HStack>
              </HStack>
              <HStack justify="space-between">
                <VStack align="start" gap={1}>
                  <Skeleton height="4" width="40px" />
                  <Skeleton height="5" width="150px" />
                </VStack>
                <VStack align="start" gap={1}>
                  <Skeleton height="4" width="30px" />
                  <Skeleton height="5" width="80px" />
                </VStack>
              </HStack>
            </VStack>
          </Box>
        ))}
      </VStack>
    );
  }

  return (
    <VStack gap={6} width="full">
      <Box w="full" bg="bg.subtle" p={"6"} rounded="3xl" shadow="md"
        bgImage={"radial-gradient(100% 100% at 50.1% 0%, #FFA103 0%, #BC2D29 41.35%, #450E14 100%)"}
      >
        <VStack align="start" gap={2}>
          <Text fontSize="lg" color="secondary.muted">Total Value Locked (TVL)</Text>
          <Text fontSize="3xl" fontWeight="bold" color="secondary.contrast">
            $   <CountUp
              enableScrollSpy
              useEasing
              easingFn={(t: number, b: number, c: number, d: number) => {
                t /= d;
                return c * (1 - Math.pow(1 - t, 5)) + b;
              }}
              end={totalTVL}
              duration={1.5}
              separator=","
              decimals={2}
              decimal="."
            />
          </Text>
        </VStack>
      </Box>

      {pools.map((pool, index) => (
        <MotionBox
          key={index}
          w="full"
          bg="bg.subtle"
          p={"4"}
          rounded="3xl"
          shadow="md"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: 1, y: 0,
            transition: { duration: 0.25, delay: index * 0.125 }
          }}
          transition={{ duration: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          cursor="pointer"
          _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
        >
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <HStack gap={2}>
                <Box position="relative" w="6" h="6" rounded="full" overflow="hidden" rotate="15deg">
                  <Box w="46%" position="absolute" overflow="hidden" h="6">
                    <Box w="6" h="6" display="flex" alignItems="center" justifyContent="center">
                      <chakra.img
                        src={pool.token0LogoURI}
                        alt={pool.token0Symbol}
                        objectFit="fill"
                        pointerEvents="none"
                      />
                    </Box>
                  </Box>
                  <Box w="46%" right="0" position="absolute" overflow="hidden" h="6" zIndex={1}>
                    <Box w="6" h="6" display="flex" alignItems="center" justifyContent="center">
                      <chakra.img
                        src={pool.token1LogoURI}
                        alt={pool.token1Symbol}
                        objectFit="fill"
                        transform="translateX(-50%)"
                        pointerEvents="none"
                      />
                    </Box>
                  </Box>
                </Box>
                <Text fontSize="md" color="fg" fontWeight="semibold">
                  {pool.token0Symbol} / {pool.token1Symbol}
                </Text>
                <Tooltip content="Phí giao dịch">
                  <Tag colorPalette="secondary">
                    {pool.fee}
                  </Tag>
                </Tooltip>
              </HStack>
              <HStack gap={2}>
                <Button
                  size="sm"
                  onClick={() => router.push(`/swap?token0=${pool.token0}&token1=${pool.token1}`)}
                >
                  Swap
                </Button>
                <Button
                  size="sm"
                  colorPalette="primary"
                  onClick={() => router.push('/positions/create')}
                >
                  Add Liquidity
                </Button>
              </HStack>
            </HStack>

            <HStack justify="space-between" color="gray.600">
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="gray.500">Price</Text>
                <Text fontWeight="medium">
                  1 {pool.token0Symbol} = {numeral(pool.price).format('0,0.[000000]')} {pool.token1Symbol}
                </Text>
              </VStack>
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="gray.500">TVL</Text>
                <Text fontWeight="medium">{pool.tvl}</Text>
              </VStack>
            </HStack>
          </VStack>
        </MotionBox>
      ))}
    </VStack>
  );
} 