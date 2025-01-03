"use client";

import {collectFeesQuote, getTickArrayStartTickIndex} from "@orca-so/whirlpools-core";
import { useEffect } from "react";
import {
  address,
  createSolanaRpc,
  fetchEncodedAccounts,
  getAddressEncoder,
  getProgramDerivedAddress
} from "@solana/web3.js";
import {
  decodePosition,
  decodeTickArray,
  decodeWhirlpool, getTickArrayAddress, Position, TickArray,
  Whirlpool,
  WHIRLPOOL_PROGRAM_ADDRESS
} from "@orca-so/whirlpools-client";

const rpc = createSolanaRpc("https://ailina-h88orw-fast-mainnet.helius-rpc.com")
const whirlpool = address("FAqh648xeeaTqL7du49sztp9nfj5PjRQrfvaMccyd9cz")
const positionMint = address("FrXRa7HDZ6fvwRSsD6WfRhK3Qr9GH5ZnAVDAdM4XANhd")
const tickLowerIndex = 15168
const tickUpperIndex = 19648
const tickSpacing = 64

async function fetchAccounts() {
  const [position] = await getProgramDerivedAddress({
    programAddress: WHIRLPOOL_PROGRAM_ADDRESS,
    seeds: ["position", getAddressEncoder().encode(positionMint)],
  })

  const lowerTickArrayStartTickIndex = getTickArrayStartTickIndex(tickLowerIndex, tickSpacing)
  const upperTickArrayStartTickIndex = getTickArrayStartTickIndex(tickUpperIndex, tickSpacing)

  const [lowerTickArray] = await getTickArrayAddress(whirlpool, lowerTickArrayStartTickIndex)
  const [upperTickArray] = await getTickArrayAddress(whirlpool, upperTickArrayStartTickIndex)

  const encodedAccounts = await fetchEncodedAccounts(rpc, [
    whirlpool,
    position,
    lowerTickArray,
    upperTickArray,
  ])

  return encodedAccounts.map((encodedAccount, index) => {
    if (!encodedAccount.exists) {
      throw new Error(`No account at position ${index}`)
    }

    switch (index) {
      case 0: {
        return decodeWhirlpool(encodedAccount).data
      }
      case 1: {
        return decodePosition(encodedAccount).data
      }
      case 2: {
        return decodeTickArray(encodedAccount).data
      }
      case 3: {
        return decodeTickArray(encodedAccount).data
      }
      default: {
        throw new Error("No case")
      }
    }
  }) as [Whirlpool, Position, TickArray, TickArray]
}

function getTickFromTickArray(tickArray: TickArray, tickIndex: number) {
  return tickArray.ticks.find((_, index) => {
    const realTickIndex = tickArray.startTickIndex + index * tickSpacing
    return realTickIndex === tickIndex
  })
}

export const Test = () => {
  useEffect(() => {
    try {
      ;(async () => {
        const [whirlpool, position, lowerTickArray, upperTickArray] = await fetchAccounts()

        const lowerTick = getTickFromTickArray(lowerTickArray, tickLowerIndex)
        const upperTick = getTickFromTickArray(upperTickArray, tickUpperIndex)

        if (!lowerTick || !upperTick) {
          throw new Error("No tick arrays")
        }

        const feesQuote = collectFeesQuote(
          whirlpool,
          position,
          lowerTick,
          upperTick
        );

        console.log({ feesQuote });
      })()

    } catch (e) {
      console.error(e);
    }
  }, []);

  return null;
};

// const dump = {
//   "orcaWhirlpool": {
//     "address": "FAqh648xeeaTqL7du49sztp9nfj5PjRQrfvaMccyd9cz",
//     "tokenA": {
//       "mint": "So11111111111111111111111111111111111111112",
//       "decimals": 9,
//       "symbol": "SOL",
//       "name": "Unknown",
//       "logo": "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
//       "unknown": false
//     },
//     "tokenB": {
//       "mint": "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
//       "decimals": 6,
//       "symbol": "PENGU",
//       "name": "Pudgy Penguins",
//       "logo": "https://arweave.net/BW67hICaKGd2_wamSB0IQq-x7Xwtmr2oJj1WnWGJRHU",
//       "unknown": false
//     },
//     "discriminator": {
//       "0": 63,
//       "1": 149,
//       "2": 209,
//       "3": 12,
//       "4": 225,
//       "5": 128,
//       "6": 99,
//       "7": 9
//     },
//     "whirlpoolsConfig": "2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ",
//     "whirlpoolBump": [
//       254
//     ],
//     "tickSpacing": 64,
//     "tickSpacingSeed": [
//       64,
//       0
//     ],
//     "feeRate": 3000,
//     "feeRateNormalised": 0.003,
//     "protocolFeeRate": 1300,
//     "liquidity": "75863129131008",
//     "sqrtPrice": "45662873728768414372",
//     "tickCurrentIndex": 18128,
//     "tickInitCurrentIndex": 18112,
//     "protocolFeeOwedA": "25383900",
//     "protocolFeeOwedB": "359874249",
//     "tokenVaultA": "J757hq9DXGPDYfCoeGpTcD9A71NFgNqBRMXHrdVGyRxK",
//     "feeGrowthGlobalA": "388600033443375837",
//     "tokenVaultB": "SdFLxX6sWTkKWje3Xb4YNewbm5ieaj3tfEJYeLTyqyg",
//     "feeGrowthGlobalB": "2113387401462746136",
//     "rewardLastUpdatedTimestamp": "1735908078",
//     "rewardInfos": [
//       {
//         "mint": "11111111111111111111111111111111",
//         "vault": "11111111111111111111111111111111",
//         "authority": "DjDsi34mSB66p2nhBL6YvhbcLtZbkGfNybFeLDjJqxJW",
//         "emissionsPerSecondX64": "0",
//         "growthGlobalX64": "0"
//       },
//       {
//         "mint": "11111111111111111111111111111111",
//         "vault": "11111111111111111111111111111111",
//         "authority": "DjDsi34mSB66p2nhBL6YvhbcLtZbkGfNybFeLDjJqxJW",
//         "emissionsPerSecondX64": "0",
//         "growthGlobalX64": "0"
//       },
//       {
//         "mint": "11111111111111111111111111111111",
//         "vault": "11111111111111111111111111111111",
//         "authority": "DjDsi34mSB66p2nhBL6YvhbcLtZbkGfNybFeLDjJqxJW",
//         "emissionsPerSecondX64": "0",
//         "growthGlobalX64": "0"
//       }
//     ],
//     "price": 6127.552409008318
//   },
//   "orcaPosition": {
//     "mint": "FrXRa7HDZ6fvwRSsD6WfRhK3Qr9GH5ZnAVDAdM4XANhd",
//     "whirlpool": "FAqh648xeeaTqL7du49sztp9nfj5PjRQrfvaMccyd9cz",
//     "liquidity": "91354442895",
//     "tickLowerIndex": 15168,
//     "tickUpperIndex": 19648,
//     "feeGrowthCheckpointA": "340282366920938463463368367551765494643",
//     "feeOwedA": "0",
//     "feeGrowthCheckpointB": "340282366920938463463235752370561182038",
//     "feeOwedB": "0",
//     "rewardInfos": [
//       {
//         "growthInsideCheckpoint": "0",
//         "amountOwed": "0"
//       },
//       {
//         "growthInsideCheckpoint": "0",
//         "amountOwed": "0"
//       },
//       {
//         "growthInsideCheckpoint": "0",
//         "amountOwed": "0"
//       }
//     ]
//   },
//   "orcaLowerTickArray": {
//     "address": "HY9Rfs5MhRpk6GZwfbZM5e7dT3jry75Zb4LC2e7iTRXj",
//     "discriminator": {
//       "0": 69,
//       "1": 97,
//       "2": 189,
//       "3": 190,
//       "4": 110,
//       "5": 7,
//       "6": 66,
//       "7": 187
//     },
//     "startTickIndex": 11264,
//     "ticks": [
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "2900283280",
//         "liquidityGross": "2900283280",
//         "feeGrowthOutsideA": "217765597646830674",
//         "feeGrowthOutsideB": "1042357735701567914",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "117195895",
//         "liquidityGross": "117195895",
//         "feeGrowthOutsideA": "177524177984282430",
//         "feeGrowthOutsideB": "753379735708449058",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "17737245039",
//         "liquidityGross": "17737245039",
//         "feeGrowthOutsideA": "148513602429968663",
//         "feeGrowthOutsideB": "579913433668887314",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "20371465998",
//         "liquidityGross": "20371465998",
//         "feeGrowthOutsideA": "91724631505811588",
//         "feeGrowthOutsideB": "322165043661966142",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "143143432701",
//         "liquidityGross": "143143432701",
//         "feeGrowthOutsideA": "145900456985549150",
//         "feeGrowthOutsideB": "569901395286504391",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "2097824",
//         "liquidityGross": "2097824",
//         "feeGrowthOutsideA": "121812607193375472",
//         "feeGrowthOutsideB": "471569443598840795",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "3505429682",
//         "liquidityGross": "3505429682",
//         "feeGrowthOutsideA": "274487602600352436",
//         "feeGrowthOutsideB": "1422390101188906365",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "5202157203",
//         "liquidityGross": "5202157203",
//         "feeGrowthOutsideA": "388325494549071654",
//         "feeGrowthOutsideB": "2108137360780324362",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "25796291839",
//         "liquidityGross": "25796291839",
//         "feeGrowthOutsideA": "135086389496501520",
//         "feeGrowthOutsideB": "523137164996626512",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "20955943884",
//         "liquidityGross": "20955943884",
//         "feeGrowthOutsideA": "134167237572880950",
//         "feeGrowthOutsideB": "520352774134915575",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "736536861",
//         "liquidityGross": "736536861",
//         "feeGrowthOutsideA": "348214857171058716",
//         "feeGrowthOutsideB": "1888535554216773378",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "3006660404",
//         "liquidityGross": "3006660404",
//         "feeGrowthOutsideA": "336125231225426759",
//         "feeGrowthOutsideB": "1823665783028821177",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "76716940436",
//         "liquidityGross": "76716940436",
//         "feeGrowthOutsideA": "235397707741903117",
//         "feeGrowthOutsideB": "1185994459113992018",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "12123076718",
//         "liquidityGross": "12123076718",
//         "feeGrowthOutsideA": "364107824873570492",
//         "feeGrowthOutsideB": "1970758510313515299",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1891986487",
//         "liquidityGross": "1891986487",
//         "feeGrowthOutsideA": "327716369006785869",
//         "feeGrowthOutsideB": "1785604265048583833",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "9",
//         "liquidityGross": "9",
//         "feeGrowthOutsideA": "214658674601504695",
//         "feeGrowthOutsideB": "1017495525490867233",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "241956632283",
//         "liquidityGross": "241956632283",
//         "feeGrowthOutsideA": "137025552664909540",
//         "feeGrowthOutsideB": "529347919674061948",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "40069009962",
//         "liquidityGross": "40069009962",
//         "feeGrowthOutsideA": "200178618578771809",
//         "feeGrowthOutsideB": "920182472560786153",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "69678078007",
//         "liquidityGross": "69678078007",
//         "feeGrowthOutsideA": "260752982137995496",
//         "feeGrowthOutsideB": "1347798299761946379",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-24189613575701",
//         "liquidityGross": "24587245370901",
//         "feeGrowthOutsideA": "68186586426203625",
//         "feeGrowthOutsideB": "216101793991110093",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1365672102",
//         "liquidityGross": "1365672102",
//         "feeGrowthOutsideA": "216738545186570889",
//         "feeGrowthOutsideB": "1034691364936900186",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "34647340074",
//         "liquidityGross": "34647340074",
//         "feeGrowthOutsideA": "262243669804061287",
//         "feeGrowthOutsideB": "1358762845124079629",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1191114664",
//         "liquidityGross": "1191114664",
//         "feeGrowthOutsideA": "352667327113224952",
//         "feeGrowthOutsideB": "1905260970850645339",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "47908799674",
//         "liquidityGross": "47908799674",
//         "feeGrowthOutsideA": "204369716860663992",
//         "feeGrowthOutsideB": "955336047358235012",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "2832326393",
//         "liquidityGross": "2832326393",
//         "feeGrowthOutsideA": "219624894629455942",
//         "feeGrowthOutsideB": "1059309690047963573",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "290529629201",
//         "liquidityGross": "290529629201",
//         "feeGrowthOutsideA": "219698643051897513",
//         "feeGrowthOutsideB": "1059623200645399406",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "47096906508",
//         "liquidityGross": "47096906508",
//         "feeGrowthOutsideA": "214094668406382641",
//         "feeGrowthOutsideB": "1015576233371328875",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "83912000047",
//         "liquidityGross": "83912000047",
//         "feeGrowthOutsideA": "149561692531398808",
//         "feeGrowthOutsideB": "583385481750130885",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "21644909867",
//         "liquidityGross": "21644909867",
//         "feeGrowthOutsideA": "382992305027881248",
//         "feeGrowthOutsideB": "2070769698506125493",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "73634271435",
//         "liquidityGross": "73634271435",
//         "feeGrowthOutsideA": "148744616264641584",
//         "feeGrowthOutsideB": "580553548131590559",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "80954648678",
//         "liquidityGross": "80954648678",
//         "feeGrowthOutsideA": "229764347558827749",
//         "feeGrowthOutsideB": "1144101100379461771",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "15825650590",
//         "liquidityGross": "15825650590",
//         "feeGrowthOutsideA": "149102705134382717",
//         "feeGrowthOutsideB": "582224960022046808",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "49155399014",
//         "liquidityGross": "49155399014",
//         "feeGrowthOutsideA": "347747158164583987",
//         "feeGrowthOutsideB": "1884765177853926966",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "8996573312",
//         "liquidityGross": "8996573312",
//         "feeGrowthOutsideA": "335822960887495316",
//         "feeGrowthOutsideB": "1822580861233084390",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "28744399578",
//         "liquidityGross": "28744399578",
//         "feeGrowthOutsideA": "353356626144049660",
//         "feeGrowthOutsideB": "1907965511264386769",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "3257801363731",
//         "liquidityGross": "3257801363731",
//         "feeGrowthOutsideA": "273258153818418317",
//         "feeGrowthOutsideB": "1416003958532429256",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "5252514666",
//         "liquidityGross": "5252514666",
//         "feeGrowthOutsideA": "158674508585854853",
//         "feeGrowthOutsideB": "636242889884839064",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "334951721067",
//         "liquidityGross": "334951721067",
//         "feeGrowthOutsideA": "185764975981031990",
//         "feeGrowthOutsideB": "807256663841917037",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "25850118389",
//         "liquidityGross": "25850118389",
//         "feeGrowthOutsideA": "256033747412012091",
//         "feeGrowthOutsideB": "1315053708845475146",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "218535489252",
//         "liquidityGross": "218535489252",
//         "feeGrowthOutsideA": "149083682213588206",
//         "feeGrowthOutsideB": "582711055226997961",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "24836367411",
//         "liquidityGross": "24836367411",
//         "feeGrowthOutsideA": "188186352861563391",
//         "feeGrowthOutsideB": "827551627259389429",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "351477061842",
//         "liquidityGross": "351477061842",
//         "feeGrowthOutsideA": "335499614424477839",
//         "feeGrowthOutsideB": "1820251195817818831",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-24355410499",
//         "liquidityGross": "456391332061",
//         "feeGrowthOutsideA": "111199595455528010",
//         "feeGrowthOutsideB": "402453134593310087",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "158011140168",
//         "liquidityGross": "160521018252",
//         "feeGrowthOutsideA": "150944152732901731",
//         "feeGrowthOutsideB": "592322592381865250",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "180702193078",
//         "liquidityGross": "180702193078",
//         "feeGrowthOutsideA": "117795460962176310",
//         "feeGrowthOutsideB": "432130490473495860",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "244230819451",
//         "liquidityGross": "244230819451",
//         "feeGrowthOutsideA": "171962410510815334",
//         "feeGrowthOutsideB": "720002462841358109",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "949428461119",
//         "liquidityGross": "949428461119",
//         "feeGrowthOutsideA": "123567086367124597",
//         "feeGrowthOutsideB": "458928022189749978",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "753532932843",
//         "liquidityGross": "753532932843",
//         "feeGrowthOutsideA": "334295763697402279",
//         "feeGrowthOutsideB": "1816428862338027402",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "4097720555634",
//         "liquidityGross": "4097720555634",
//         "feeGrowthOutsideA": "220671644843153193",
//         "feeGrowthOutsideB": "1065456577569649483",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1020515937602",
//         "liquidityGross": "1333420302708",
//         "feeGrowthOutsideA": "213697011984542626",
//         "feeGrowthOutsideB": "1011493810914352411",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "658874393735",
//         "liquidityGross": "658874393735",
//         "feeGrowthOutsideA": "180804016493203382",
//         "feeGrowthOutsideB": "771714793506757509",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "29013281794",
//         "liquidityGross": "29013281794",
//         "feeGrowthOutsideA": "354123692339047442",
//         "feeGrowthOutsideB": "1911947581477995823",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "43018767182",
//         "liquidityGross": "169128698160",
//         "feeGrowthOutsideA": "156348182690375183",
//         "feeGrowthOutsideB": "620204318518372264",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "3471947698205",
//         "liquidityGross": "3471947698205",
//         "feeGrowthOutsideA": "298285887626799621",
//         "feeGrowthOutsideB": "1579827263738057617",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "163794625455",
//         "liquidityGross": "166687172623",
//         "feeGrowthOutsideA": "137795247434576895",
//         "feeGrowthOutsideB": "528177808805459794",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1289612798956",
//         "liquidityGross": "1289612798956",
//         "feeGrowthOutsideA": "192229032751677040",
//         "feeGrowthOutsideB": "847984331247309840",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "62269667497",
//         "liquidityGross": "62269667497",
//         "feeGrowthOutsideA": "264077534363754938",
//         "feeGrowthOutsideB": "1359147119254915139",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "242134376109",
//         "liquidityGross": "242134376109",
//         "feeGrowthOutsideA": "180443438586537716",
//         "feeGrowthOutsideB": "762050826505167211",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-27323551117",
//         "liquidityGross": "82091658477",
//         "feeGrowthOutsideA": "177992996595513248",
//         "feeGrowthOutsideB": "749185669235911533",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "7974933672",
//         "liquidityGross": "33934297934",
//         "feeGrowthOutsideA": "150959703334458171",
//         "feeGrowthOutsideB": "593876593496257850",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "310268658532",
//         "liquidityGross": "310268658532",
//         "feeGrowthOutsideA": "165329173810176487",
//         "feeGrowthOutsideB": "666819051636085575",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "727894093463",
//         "liquidityGross": "755538851127",
//         "feeGrowthOutsideA": "157131737934120971",
//         "feeGrowthOutsideB": "625208632785535594",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1664018661",
//         "liquidityGross": "1664018661",
//         "feeGrowthOutsideA": "256535163782357588",
//         "feeGrowthOutsideB": "1305468841874986581",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "532209551126",
//         "liquidityGross": "701889631786",
//         "feeGrowthOutsideA": "218336444411000294",
//         "feeGrowthOutsideB": "1027516487754548578",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "377069583043",
//         "liquidityGross": "377069583043",
//         "feeGrowthOutsideA": "171376245624671709",
//         "feeGrowthOutsideB": "698655826800783111",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "27953418024",
//         "liquidityGross": "27953418024",
//         "feeGrowthOutsideA": "192296210367016093",
//         "feeGrowthOutsideB": "829182668753070506",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-3018865190389",
//         "liquidityGross": "3207194427849",
//         "feeGrowthOutsideA": "173404541874488309",
//         "feeGrowthOutsideB": "709809014166672644",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "565006403403",
//         "liquidityGross": "565006403403",
//         "feeGrowthOutsideA": "268331842879463091",
//         "feeGrowthOutsideB": "1373560549072907489",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "56813559208",
//         "liquidityGross": "56813559208",
//         "feeGrowthOutsideA": "175482633522531395",
//         "feeGrowthOutsideB": "721356727782337411",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "1449855204213",
//         "liquidityGross": "1450077400123",
//         "feeGrowthOutsideA": "176878290575204691",
//         "feeGrowthOutsideB": "729049328008972562",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "289408823108",
//         "liquidityGross": "289408823108",
//         "feeGrowthOutsideA": "225226953127357541",
//         "feeGrowthOutsideB": "1062973655286752004",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "235365269258",
//         "liquidityGross": "242700467232",
//         "feeGrowthOutsideA": "181096851509963940",
//         "feeGrowthOutsideB": "752103026160778290",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "377966398908",
//         "liquidityGross": "377966398908",
//         "feeGrowthOutsideA": "387402240906936688",
//         "feeGrowthOutsideB": "2100445808168407626",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "369428808059",
//         "liquidityGross": "417497995925",
//         "feeGrowthOutsideA": "240830599805716577",
//         "feeGrowthOutsideB": "1150490695256965268",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       }
//     ],
//     "whirlpool": "FAqh648xeeaTqL7du49sztp9nfj5PjRQrfvaMccyd9cz"
//   },
//   "orcaUpperTickArray": {
//     "address": "9Cn1YHwrjVNupjDHsnhJAe5hRkHsNjEt42Vaw3Ez4PNT",
//     "discriminator": {
//       "0": 69,
//       "1": 97,
//       "2": 189,
//       "3": 190,
//       "4": 110,
//       "5": 7,
//       "6": 66,
//       "7": 187
//     },
//     "startTickIndex": 16896,
//     "ticks": [
//       {
//         "initialized": true,
//         "liquidityNet": "7195326226023",
//         "liquidityGross": "7561553209067",
//         "feeGrowthOutsideA": "246457000345919901",
//         "feeGrowthOutsideB": "1182297362425876135",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "44115083985",
//         "liquidityGross": "44115083985",
//         "feeGrowthOutsideA": "196385073191287481",
//         "feeGrowthOutsideB": "836064481548285733",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-302202156349",
//         "liquidityGross": "366684084731",
//         "feeGrowthOutsideA": "215184977640399251",
//         "feeGrowthOutsideB": "950391922535077868",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-326192971077",
//         "liquidityGross": "358373758307",
//         "feeGrowthOutsideA": "204344013797084016",
//         "feeGrowthOutsideB": "880526728560710080",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "14261578046",
//         "liquidityGross": "483829856822",
//         "feeGrowthOutsideA": "276845421515340082",
//         "feeGrowthOutsideB": "1399006528684900296",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "102088154476",
//         "liquidityGross": "111127182798",
//         "feeGrowthOutsideA": "298204827116017832",
//         "feeGrowthOutsideB": "1534051863409253290",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-6483041339",
//         "liquidityGross": "6483041339",
//         "feeGrowthOutsideA": "233954330400851984",
//         "feeGrowthOutsideB": "1065178915357418461",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-49579217239",
//         "liquidityGross": "60990939761",
//         "feeGrowthOutsideA": "218714884924353446",
//         "feeGrowthOutsideB": "962443061966345449",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-287970382262",
//         "liquidityGross": "554875236798",
//         "feeGrowthOutsideA": "228533515712005919",
//         "feeGrowthOutsideB": "1020117166133889190",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-28549194117",
//         "liquidityGross": "76261918947",
//         "feeGrowthOutsideA": "234133160165455451",
//         "feeGrowthOutsideB": "1056517509213036406",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-531897125065",
//         "liquidityGross": "531897125065",
//         "feeGrowthOutsideA": "227987261843325472",
//         "feeGrowthOutsideB": "1016701500600221470",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-1694005233294",
//         "liquidityGross": "1694005233294",
//         "feeGrowthOutsideA": "295698313306575864",
//         "feeGrowthOutsideB": "1510721214097040772",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-338825823383",
//         "liquidityGross": "338825823383",
//         "feeGrowthOutsideA": "234384542780165020",
//         "feeGrowthOutsideB": "1054709335126054629",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-186750548559",
//         "liquidityGross": "186750548559",
//         "feeGrowthOutsideA": "237047984748630220",
//         "feeGrowthOutsideB": "1070756254236332021",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-129395901887",
//         "liquidityGross": "129395901887",
//         "feeGrowthOutsideA": "282763144947838027",
//         "feeGrowthOutsideB": "1402042150592235711",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-279525399841",
//         "liquidityGross": "279525399841",
//         "feeGrowthOutsideA": "243991048149965413",
//         "feeGrowthOutsideB": "1112750852423261368",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-18113884929",
//         "liquidityGross": "18628361073",
//         "feeGrowthOutsideA": "268616479463085910",
//         "feeGrowthOutsideB": "1303346740153780339",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-91413289384",
//         "liquidityGross": "91413289384",
//         "feeGrowthOutsideA": "388507749668977876",
//         "feeGrowthOutsideB": "2111963831442852089",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-474920804864",
//         "liquidityGross": "474920804864",
//         "feeGrowthOutsideA": "251381941036132366",
//         "feeGrowthOutsideB": "1158531939927131404",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-87564852309",
//         "liquidityGross": "157295002443",
//         "feeGrowthOutsideA": "254612332138287711",
//         "feeGrowthOutsideB": "1178655218786737831",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-810372282073",
//         "liquidityGross": "810372552665",
//         "feeGrowthOutsideA": "130764346793953915",
//         "feeGrowthOutsideB": "914808200556561434",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-264627008993",
//         "liquidityGross": "264627008993",
//         "feeGrowthOutsideA": "128023207116230581",
//         "feeGrowthOutsideB": "897836121437802034",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "5031854242943",
//         "liquidityGross": "6070276911979",
//         "feeGrowthOutsideA": "104142032080427514",
//         "feeGrowthOutsideB": "716065215282683871",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-42769142521",
//         "liquidityGross": "53788095301",
//         "feeGrowthOutsideA": "121925954651695216",
//         "feeGrowthOutsideB": "859721327212758214",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-959799846975",
//         "liquidityGross": "959799846975",
//         "feeGrowthOutsideA": "118768165543015003",
//         "feeGrowthOutsideB": "839792697052301815",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-140924894439",
//         "liquidityGross": "140924894439",
//         "feeGrowthOutsideA": "115092938951993276",
//         "feeGrowthOutsideB": "816457475880806195",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-7089683826268",
//         "liquidityGross": "7134775506482",
//         "feeGrowthOutsideA": "80122850312839014",
//         "feeGrowthOutsideB": "561377249847803712",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-223191152576",
//         "liquidityGross": "223191152622",
//         "feeGrowthOutsideA": "107909447335479211",
//         "feeGrowthOutsideB": "770409697011079091",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-457929208325",
//         "liquidityGross": "472718736561",
//         "feeGrowthOutsideA": "104947432012622273",
//         "feeGrowthOutsideB": "751231948549087896",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-104686694203",
//         "liquidityGross": "104686694203",
//         "feeGrowthOutsideA": "101817465913780582",
//         "feeGrowthOutsideB": "730869682053052799",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-208590761443",
//         "liquidityGross": "208590761443",
//         "feeGrowthOutsideA": "98685111439666759",
//         "feeGrowthOutsideB": "710375531514295104",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-339581621862",
//         "liquidityGross": "339581621862",
//         "feeGrowthOutsideA": "90701239413260683",
//         "feeGrowthOutsideB": "652777091031701109",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-612506293348",
//         "liquidityGross": "614686120984",
//         "feeGrowthOutsideA": "91280495189951426",
//         "feeGrowthOutsideB": "661454335962279535",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-657562920581",
//         "liquidityGross": "657562920581",
//         "feeGrowthOutsideA": "87693476493399522",
//         "feeGrowthOutsideB": "637533160657972823",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-4997192979439",
//         "liquidityGross": "4997192979439",
//         "feeGrowthOutsideA": "84100711066121338",
//         "feeGrowthOutsideB": "613418394675964376",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-312375354116",
//         "liquidityGross": "312375354116",
//         "feeGrowthOutsideA": "80860570682664728",
//         "feeGrowthOutsideB": "591529598718699707",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-82471600477",
//         "liquidityGross": "82471600477",
//         "feeGrowthOutsideA": "59344768935753565",
//         "feeGrowthOutsideB": "428783850331500809",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-292491893539",
//         "liquidityGross": "292540802983",
//         "feeGrowthOutsideA": "52955865237204537",
//         "feeGrowthOutsideB": "383944650476531467",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-5474787295",
//         "liquidityGross": "9439237431",
//         "feeGrowthOutsideA": "52413829720152885",
//         "feeGrowthOutsideB": "381956902318381265",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-4385990831026",
//         "liquidityGross": "4385990831026",
//         "feeGrowthOutsideA": "13155623979845680",
//         "feeGrowthOutsideB": "96365549317754275",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-57609372193",
//         "liquidityGross": "57609372193",
//         "feeGrowthOutsideA": "40582866764659589",
//         "feeGrowthOutsideB": "303998129511196120",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-2627249344582",
//         "liquidityGross": "2627249344596",
//         "feeGrowthOutsideA": "57030819772157168",
//         "feeGrowthOutsideB": "426991053848441750",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-41074352135",
//         "liquidityGross": "41074352135",
//         "feeGrowthOutsideA": "52544000929921647",
//         "feeGrowthOutsideB": "395295419249602992",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-742744634979",
//         "liquidityGross": "742744634979",
//         "feeGrowthOutsideA": "48907059211668900",
//         "feeGrowthOutsideB": "369439434559592375",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-236742621996",
//         "liquidityGross": "238020529344",
//         "feeGrowthOutsideA": "45575956088345601",
//         "feeGrowthOutsideB": "345605986927698839",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-8769069490",
//         "liquidityGross": "8769069490",
//         "feeGrowthOutsideA": "36565703132789484",
//         "feeGrowthOutsideB": "275362926147536486",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-7727707151",
//         "liquidityGross": "7727707151",
//         "feeGrowthOutsideA": "40237555884946341",
//         "feeGrowthOutsideB": "307043675227543142",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-138253374671",
//         "liquidityGross": "138253374671",
//         "feeGrowthOutsideA": "25486730468651213",
//         "feeGrowthOutsideB": "196163189563265265",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-58124672102",
//         "liquidityGross": "58124672102",
//         "feeGrowthOutsideA": "34930457542883789",
//         "feeGrowthOutsideB": "268184705770173122",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-11418981811",
//         "liquidityGross": "11418981811",
//         "feeGrowthOutsideA": "28515757619782310",
//         "feeGrowthOutsideB": "220627903773086317",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "65",
//         "liquidityGross": "65",
//         "feeGrowthOutsideA": "21331657177223680",
//         "feeGrowthOutsideB": "166684373172279839",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-8640959814",
//         "liquidityGross": "8640959814",
//         "feeGrowthOutsideA": "18279489230433136",
//         "feeGrowthOutsideB": "143551848508424332",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-52874644695",
//         "liquidityGross": "52874644695",
//         "feeGrowthOutsideA": "15510461875781791",
//         "feeGrowthOutsideB": "122434556211204222",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-37544748718",
//         "liquidityGross": "37544748718",
//         "feeGrowthOutsideA": "13390177381767047",
//         "feeGrowthOutsideB": "106155461355841768",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-67589943967",
//         "liquidityGross": "67589943967",
//         "feeGrowthOutsideA": "9762723480828925",
//         "feeGrowthOutsideB": "77917170678249208",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-42942903712",
//         "liquidityGross": "70924771304",
//         "feeGrowthOutsideA": "9826977181100418",
//         "feeGrowthOutsideB": "78534793224202636",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "143382473390",
//         "liquidityGross": "385550544136",
//         "feeGrowthOutsideA": "8192855241781470",
//         "feeGrowthOutsideB": "65746487279421762",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-348656381215",
//         "liquidityGross": "348656381215",
//         "feeGrowthOutsideA": "5953979795487976",
//         "feeGrowthOutsideB": "48073514946893281",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "95656121922429",
//         "liquidityGross": "95700517569309",
//         "feeGrowthOutsideA": "4864467639610201",
//         "feeGrowthOutsideB": "39379083476144380",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-61759313142",
//         "liquidityGross": "61759313142",
//         "feeGrowthOutsideA": "3207742236712793",
//         "feeGrowthOutsideB": "26075876777037784",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-10868879689",
//         "liquidityGross": "10868879689",
//         "feeGrowthOutsideA": "1797467824111374",
//         "feeGrowthOutsideB": "14678022230812294",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-9698483751",
//         "liquidityGross": "9698483751",
//         "feeGrowthOutsideA": "698422142814705",
//         "feeGrowthOutsideB": "5745057559065498",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-151712886228",
//         "liquidityGross": "151712886228",
//         "feeGrowthOutsideA": "141991864034425",
//         "feeGrowthOutsideB": "1178616926674409",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-27541380711",
//         "liquidityGross": "27541380711",
//         "feeGrowthOutsideA": "44564165262676",
//         "feeGrowthOutsideB": "371524194818009",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-54616671454",
//         "liquidityGross": "54616671454",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-24454722",
//         "liquidityGross": "24454722",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-25726269514",
//         "liquidityGross": "25726269514",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-29062860962",
//         "liquidityGross": "29062860962",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-579325490666",
//         "liquidityGross": "579325490666",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-29085661630",
//         "liquidityGross": "29085661630",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-28513776962",
//         "liquidityGross": "28513776962",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-43219452324",
//         "liquidityGross": "43219452324",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-3178559489",
//         "liquidityGross": "3178559489",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-59796756155",
//         "liquidityGross": "59796756155",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-6096841594",
//         "liquidityGross": "6096841594",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": false,
//         "liquidityNet": "0",
//         "liquidityGross": "0",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-3084379990",
//         "liquidityGross": "3084379990",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-95678319745869",
//         "liquidityGross": "95678319745869",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-7869250559",
//         "liquidityGross": "7869250559",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       },
//       {
//         "initialized": true,
//         "liquidityNet": "-4170418310",
//         "liquidityGross": "4170418310",
//         "feeGrowthOutsideA": "0",
//         "feeGrowthOutsideB": "0",
//         "rewardGrowthsOutside": [
//           "0",
//           "0",
//           "0"
//         ]
//       }
//     ],
//     "whirlpool": "FAqh648xeeaTqL7du49sztp9nfj5PjRQrfvaMccyd9cz"
//   },
//   "orcaLowerTick": {
//     "initialized": true,
//     "liquidityNet": "753532932843",
//     "liquidityGross": "753532932843",
//     "feeGrowthOutsideA": "334295763697402279",
//     "feeGrowthOutsideB": "1816428862338027402",
//     "rewardGrowthsOutside": [
//       "0",
//       "0",
//       "0"
//     ]
//   },
//   "orcaUpperTick": {
//     "initialized": true,
//     "liquidityNet": "-742744634979",
//     "liquidityGross": "742744634979",
//     "feeGrowthOutsideA": "48907059211668900",
//     "feeGrowthOutsideB": "369439434559592375",
//     "rewardGrowthsOutside": [
//       "0",
//       "0",
//       "0"
//     ]
//   }
// }
