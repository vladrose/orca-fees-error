"use client";
import { collectFeesQuote } from "@orca-so/whirlpools-core";
import { useEffect } from "react";

export const Test = () => {
  useEffect(() => {
    try {
      const orcaWhirlpool = {
        address: "6a3m2EgFFKfsFuQtP4LJJXPcAe3TQYXNyHUjjZpUxYgd",
        tokenA: {
          mint: "So11111111111111111111111111111111111111112",
          decimals: 9,
          symbol: "SOL",
          name: "Unknown",
          logo: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
          unknown: false,
        },
        tokenB: {
          mint: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4",
          decimals: 6,
          symbol: "JLP",
          name: "Unknown",
          logo: "https://static.jup.ag/jlp/icon.png",
          unknown: false,
        },
        discriminator: {
          "0": 63,
          "1": 149,
          "2": 209,
          "3": 12,
          "4": 225,
          "5": 128,
          "6": 99,
          "7": 9,
        },
        whirlpoolsConfig: "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
        whirlpoolBump: [255],
        tickSpacing: 4,
        tickSpacingSeed: [4, 0],
        feeRate: 400,
        feeRateNormalised: 0.0004,
        protocolFeeRate: 1300,
        liquidity: 56189389633218n,
        sqrtPrice: 3932801585977774999n,
        tickCurrentIndex: -30913,
        tickInitCurrentIndex: -30916,
        protocolFeeOwedA: 16319100307,
        protocolFeeOwedB: 745168804,
        tokenVaultA: "Gg5msGGYPXGt9JpAC5oVdimjWZEXzKpunRDALaJ1Ny1U",
        feeGrowthGlobalA: 3607046902104224153n,
        tokenVaultB: "EQCDoN8WHzYxCRmhxHBSEYCL5muMaZ2HHWbY121fEYsu",
        feeGrowthGlobalB: 201601266824688286n,
        rewardLastUpdatedTimestamp: 1735508949n,
        rewardInfos: [
          {
            mint: "11111111111111111111111111111111",
            vault: "11111111111111111111111111111111",
            authority: "DjDsi34mSB66p2nhBL6YvhbcLtZbkGfNybFeLDjJqxJW",
            emissionsPerSecondX64: 0n,
            growthGlobalX64: 0n,
          },
          {
            mint: "11111111111111111111111111111111",
            vault: "11111111111111111111111111111111",
            authority: "DjDsi34mSB66p2nhBL6YvhbcLtZbkGfNybFeLDjJqxJW",
            emissionsPerSecondX64: 0n,
            growthGlobalX64: 0n,
          },
          {
            mint: "11111111111111111111111111111111",
            vault: "11111111111111111111111111111111",
            authority: "DjDsi34mSB66p2nhBL6YvhbcLtZbkGfNybFeLDjJqxJW",
            emissionsPerSecondX64: 0n,
            growthGlobalX64: 0n,
          },
        ],
        price: 45.453217146167624,
      };
      const orcaPosition = {
        mint: "9eeTxs98xDUAJoL6T785f64Mbcg9sCB8BpExuTTXqEDt",
        whirlpool: "6a3m2EgFFKfsFuQtP4LJJXPcAe3TQYXNyHUjjZpUxYgd",
        liquidity: 47904419956n,
        tickLowerIndex: -30892,
        tickUpperIndex: -30652,
        feeGrowthCheckpointA: 340282366920938463463373384028245914920n,
        feeOwedA: 0n,
        feeGrowthCheckpointB: 340282366920938463463374549090170269435n,
        feeOwedB: 0n,
        rewardInfos: [
          { growthInsideCheckpoint: 0n, amountOwed: 0n },
          { growthInsideCheckpoint: 0n, amountOwed: 0n },
          { growthInsideCheckpoint: 0n, amountOwed: 0n },
        ],
      };
      const orcaLowerTick = {
        initialized: true,
        liquidityNet: 80950947829n,
        liquidityGross: 80950947829n,
        feeGrowthOutsideA: 4074422774403688n,
        feeGrowthOutsideB: 178928837142639n,
        rewardGrowthsOutside: [0n, 0n, 0n],
      };
      const orcaUpperTick = {
        initialized: true,
        liquidityNet: -137484101343n,
        liquidityGross: 137484101343n,
        feeGrowthOutsideA: 2066439852052906n,
        feeGrowthOutsideB: 96759302799246n,
        rewardGrowthsOutside: [0n, 0n, 0n],
      };

      const feesQuote = collectFeesQuote(
        orcaWhirlpool,
        orcaPosition,
        orcaLowerTick,
        orcaUpperTick
      );

      console.log({ feesQuote });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return null;
};
