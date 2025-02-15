import create from "zustand";
import { createUISlice } from "./ui/ui";
import {
  createBondsSlice,
  createCrowdloanRewardsSlice,
  createMetamaskSlice,
  createOracleSlice,
  createPolkadotSlice,
  createStakingRewardsSlice,
  createStatsApolloSlice,
  createStatsOverviewSlice,
  createStatsTelemetrySlice,
  createSubstrateBalancesSlice,
  createTransfersSlice,
} from "./defi";

import { AllSlices } from "./types";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

export const useStore = create<AllSlices>()(
  immer(
    devtools((...a) => ({
      ...createUISlice(...a),
      ...createTransfersSlice(...a),
      ...createPolkadotSlice(...a),
      ...createMetamaskSlice(...a),
      ...createStatsApolloSlice(...a),
      ...createStatsOverviewSlice(...a),
      ...createStatsTelemetrySlice(...a),
      ...createSubstrateBalancesSlice(...a),
      ...createCrowdloanRewardsSlice(...a),
      ...createBondsSlice(...a),
      ...createOracleSlice(...a),
      ...createStakingRewardsSlice(...a),
    }))
  )
);
