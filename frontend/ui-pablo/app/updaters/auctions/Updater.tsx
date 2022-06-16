import { useEffect } from "react";
import { useParachainApi } from "substrate-react";
import useStore from "@/store/useStore";
import { DEFAULT_NETWORK_ID } from "@/defi/utils/constants";
import { fetchSpotPrice } from "@/defi/utils";
import {
  fetchAuctions, fetchTrades,
} from "@/defi/utils/pablo/auctions";

const Updater = () => {
  const {
    apollo,
    pools: {
      liquidityBootstrappingPools,
      setLiquidityBootstrappingPoolSpotPrice,
    },
    auctions,
    putStatsActiveLBP,
    putHistoryActiveLBP,
  } = useStore();
  const { parachainApi } = useParachainApi(DEFAULT_NETWORK_ID);
  /**
   * Queries initiated on an Auctions
   * LBP selection
   */
  useEffect(() => {
    const { poolId } = auctions.activeLBP;
    if (parachainApi && poolId !== -1) {
      fetchAuctions(parachainApi, auctions.activeLBP)
        .then((data) => {
          putStatsActiveLBP(data);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [parachainApi, auctions.activeLBP]);
  /**
   * Update trade history
   * in history tab
   * add apollo here as well
   */
  useEffect(() => {
    const { poolId } = auctions.activeLBP;
    if (poolId !== -1) {
      fetchTrades(auctions.activeLBP).then(trades => {
        putHistoryActiveLBP(trades)
      }).catch(err => {
        console.error(err);
      })
    } else {
      putHistoryActiveLBP([]);
    }
  }, [auctions.activeLBP])
  /**
   * This effect is called to show prices
   * on auctions page
   */
  useEffect(() => {
    if (parachainApi && liquidityBootstrappingPools.verified.length > 0) {
      for (
        let pool = 0;
        pool < liquidityBootstrappingPools.verified.length;
        pool++
      ) {
        let quoteId =
          liquidityBootstrappingPools.verified[pool].pair.quote.toString();
        if (apollo[quoteId]) {
          fetchSpotPrice(
            parachainApi,
            liquidityBootstrappingPools.verified[pool].pair,
            liquidityBootstrappingPools.verified[pool].poolId
          ).then((spotPrice) => {
            spotPrice = spotPrice.times(apollo[quoteId]);
            setLiquidityBootstrappingPoolSpotPrice(
              liquidityBootstrappingPools.verified[pool].poolId,
              spotPrice.toFixed(4)
            );
          }).catch(err => {
            console.error(err);
          })
        }
      }
    }
  }, [parachainApi, liquidityBootstrappingPools.verified.length, apollo]);

  return null;
};

export default Updater;
