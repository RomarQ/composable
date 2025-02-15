import { fromChainIdUnit, humanBalance, toChainIdUnit, unwrapNumberOrHex } from "shared";
import { FeeDisplay } from "@/components";
import React, { useCallback, useEffect } from "react";
import { useStore } from "@/stores/root";
import { useAllParachainProviders } from "@/defi/polkadot/context/hooks";
import { useExecutor } from "substrate-react";
import { useSelectedAccount } from "@/defi/polkadot/hooks";
import { SUBSTRATE_NETWORKS } from "@/defi/polkadot/Networks";
import { AssetId } from "@/defi/polkadot/types";
import BigNumber from "bignumber.js";
import { getApiCallAndSigner } from "@/defi/polkadot/pallets/Transfer";

export const TransferFeeDisplay = () => {
  const { tokenId } = useStore(({ transfers }) => transfers);
  const from = useStore((state) => state.transfers.networks.from);
  const to = useStore((state) => state.transfers.networks.to);
  const allProviders = useAllParachainProviders();
  const provider = allProviders[from];
  const executor = useExecutor();
  const account = useSelectedAccount();
  const assets = useStore(
    ({ substrateBalances }) => substrateBalances[from].assets
  );
  const symbol = useStore(
    ({ substrateBalances }) => substrateBalances[from].native.meta.symbol
  );
  const amount = useStore((state) => state.transfers.amount);
  const { hasFeeItem, feeItem } = useStore(({ transfers }) => transfers);
  const selectedRecipient = useStore(
    (state) => state.transfers.recipients.selected
  );
  const keepAlive = useStore((state) => state.transfers.keepAlive);
  const existentialDeposit = useStore(
    ({ substrateBalances }) => substrateBalances[from].native.existentialDeposit
  );
  const { updateFee, fee } = useStore(({ transfers }) => transfers);

  const feeItemId =
    hasFeeItem && feeItem.length > 0
      ? assets[feeItem as AssetId].meta.supportedNetwork[from]
      : null;

  const calculateFee = useCallback(async () => {
    if (
      !provider.parachainApi ||
      !executor ||
      !account ||
      (hasFeeItem && feeItem.length === 0)
    ) {
      return null;
    }

    const api = provider.parachainApi;

    const TARGET_ACCOUNT_ADDRESS = selectedRecipient.length
      ? selectedRecipient
      : account.address;

    const TARGET_PARACHAIN_ID = SUBSTRATE_NETWORKS[to].parachainId;
    // Set amount to transfer
    const amountToTransfer = api.createType(
      "u128",
      toChainIdUnit(
        keepAlive && amount.gt(existentialDeposit)
          ? amount.minus(existentialDeposit)
          : amount
      ).toString()
    );
    const signerAddress = account.address;


    const { call, signer } = await getApiCallAndSigner(
      api,
      TARGET_ACCOUNT_ADDRESS,
      amountToTransfer,
      feeItemId,
      signerAddress,
      TARGET_PARACHAIN_ID,
      from,
      to,
      hasFeeItem
    );
    executor.paymentInfo(call, account.address, signer).then((info) => {
      updateFee({
        class: info.class.toString(),
        partialFee: fromChainIdUnit(
          unwrapNumberOrHex(info.partialFee.toString())
        ),
        weight: unwrapNumberOrHex(info.weight.toString())
      } as {
        class: string;
        partialFee: BigNumber;
        weight: BigNumber;
      });
    });
  }, [
    provider.parachainApi,
    executor,
    account,
    from,
    to,
    amount,
    feeItemId,
    hasFeeItem,
    selectedRecipient,
    keepAlive,
    existentialDeposit,
    updateFee,
    feeItem.length
  ]);

  useEffect(() => {
    calculateFee();
  }, [calculateFee]);

  return (
    <FeeDisplay
      label="Fee"
      feeText={`${humanBalance(fee.partialFee)} ${symbol}`}
      TooltipProps={{
        title: "Fee tooltip title"
      }}
    />
  );
};
