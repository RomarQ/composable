import { StoreSlice } from "../../types";
import BigNumber from "bignumber.js";

interface ApolloTableData {
  symbol: string;
  binanceValue: number;
  pabloValue: number;
  aggregatedValue: number;
  apolloValue: number;
  changeValue: number;
}

type PriceHashMap = {
  [key: string]: { open: BigNumber | null; close: BigNumber | null };
};

interface ApolloState {
  binanceAssets: PriceHashMap;
  oracleAssets: PriceHashMap;
}

export const APOLLO_ALLOWED_CURRENCIES = ["KSM", "USDC", "PABLO", "PICA"];

const initialState: ApolloState = {
  binanceAssets: APOLLO_ALLOWED_CURRENCIES.reduce((acc, curr) => {
    acc[curr] = {
      open: null,
      close: null,
    };
    return acc;
  }, <PriceHashMap>{}),
  oracleAssets: APOLLO_ALLOWED_CURRENCIES.reduce((acc, curr) => {
    acc[curr] = {
      open: null,
      close: null,
    };
    return acc;
  }, <PriceHashMap>{}),
};

export interface StatsApolloSlice {
  statsApollo: ApolloState & {
    setBinanceAssets: (
      symbol: string,
      open: BigNumber | null,
      close: BigNumber | null
    ) => void;
    setOracleAssets: (
      symbol: string,
      open: BigNumber | null,
      close: BigNumber | null
    ) => void;
  };
}

export const createStatsApolloSlice: StoreSlice<StatsApolloSlice> = (set) => ({
  statsApollo: {
    ...initialState,
    setBinanceAssets: (
      symbol: string,
      open: BigNumber | null,
      close: BigNumber | null
    ) => {
      set((state) => {
        state.statsApollo.binanceAssets[symbol] = {
          open,
          close,
        };

        return state;
      });
    },
    setOracleAssets: (
      symbol: string,
      open: BigNumber | null,
      close: BigNumber | null
    ) => {
      set((state) => {
        state.statsApollo.oracleAssets[symbol] = {
          open,
          close,
        };

        return state;
      });
    },
  },
});
