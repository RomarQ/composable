import { StateCreator } from "zustand";

import {
  CrowdloanRewardsSlice,
  MetamaskSlice,
  OracleSlice,
  PolkadotSlice,
  StakingRewardsSlice,
  StatsApolloSlice,
  StatsOverviewSlice,
  StatsTelemetrySlice,
  SubstrateBalancesSlice,
  TransfersSlice,
} from "./defi";
import { UISlice } from "./ui/ui";
import { BondsSlice } from "@/stores/defi/polkadot/bonds/slice";

export type StoreSlice<T> = StateCreator<
  AllSlices,
  [["zustand/immer", never], ["zustand/devtools", never]],
  [],
  T
>;
export type AllSlices = PolkadotSlice &
  UISlice &
  MetamaskSlice &
  TransfersSlice &
  StatsApolloSlice &
  StatsOverviewSlice &
  StatsTelemetrySlice &
  SubstrateBalancesSlice &
  CrowdloanRewardsSlice &
  BondsSlice &
  OracleSlice &
  StakingRewardsSlice;
