import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  DotSamaContext,
  DotSamaExtensionStatus,
  ParachainApi,
  ParachainId,
  RelaychainApi,
  RelayChainId,
  SupportedWalletId,
} from "./types";
import { ParachainNetworks, RelayChainNetworks } from "./Networks";
import type {
  InjectedAccount,
  InjectedAccountWithMeta,
  InjectedExtension,
} from "@polkadot/extension-inject/types";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { createParachainApis } from "./utils";

const truncate_regex = /^([a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

function mapAccounts(
  source: string,
  list: InjectedAccount[],
  ss58Format?: number
): InjectedAccountWithMeta[] {
  return list.map(
    ({ address, genesisHash, name, type }): InjectedAccountWithMeta => ({
      address:
        address.length === 42
          ? address
          : encodeAddress(decodeAddress(address), ss58Format),
      meta: { genesisHash, name, source },
      type,
    })
  );
}

const PARACHAIN_PROVIDERS_DEFAULT: {
  [chainId in ParachainId]: ParachainApi;
} = Object.entries(ParachainNetworks)
  .map(([chainId, network]) => {
    return {
      chainId: chainId,
      parachainApi: undefined,
      apiStatus: "initializing",
      prefix: network.prefix,
      accounts: [],
    };
  })
  .reduce((acc, curr) => {
    return {
      ...acc,
      [curr.chainId]: curr,
    };
  }, {} as { [chainId in ParachainId]: ParachainApi });

const RELAYCHAIN_PROVIDERS_DEFAULT: {
  [chainId in RelayChainId]: RelaychainApi;
} = Object.entries(RelayChainNetworks)
  .map(([chainId, network]) => {
    return {
      chainId: chainId,
      parachainApi: undefined,
      apiStatus: "initializing",
      prefix: network.prefix,
      accounts: [],
    };
  })
  .reduce((acc, curr) => {
    return {
      ...acc,
      [curr.chainId]: curr,
    };
  }, {} as { [chainId in RelayChainId]: RelaychainApi });

export const DotsamaContext = createContext<DotSamaContext>({
  signer: undefined,
  parachainProviders: PARACHAIN_PROVIDERS_DEFAULT,
  relaychainProviders: RELAYCHAIN_PROVIDERS_DEFAULT,
  extensionStatus: "initializing",
  activate: undefined,
  selectedAccount: -1,
});

export const DotSamaContextProvider = ({
  supportedParachains,
  children,
  appName,
}: {
  appName: string;
  supportedParachains: {
    chainId: ParachainId;
    rpcUrl: string;
    rpc: any;
    types: any;
  }[];
  children: React.ReactNode;
}) => {
  const [parachainProviders, setParachainProviders] = useState<{
    [chainId in ParachainId]: ParachainApi;
  }>(PARACHAIN_PROVIDERS_DEFAULT);
  const [relaychainProviders, setRelayChainProviders] = useState<{
    [chainId in RelayChainId]: RelaychainApi;
  }>(RELAYCHAIN_PROVIDERS_DEFAULT);

  const [extensionInjected, setInjectedExtension] = useState<
    InjectedExtension | undefined
  >(undefined);
  const [extensionStatus, setExtensionStatus] =
    useState<DotSamaExtensionStatus>("initializing");
  const activate = async (
    walletId: SupportedWalletId = SupportedWalletId.Polkadotjs,
    selectDefaultAccount: boolean = false
  ): Promise<any | undefined> => {
    setExtensionStatus("connecting");

    let injectedExtension, extensionError;
    try {
      if (!window.injectedWeb3) throw new Error("Extension not installed.");

      let extension = window.injectedWeb3[walletId];
      if (!extension) throw new Error("Extension not installed.");

      injectedExtension = await extension.enable(appName);
    } catch (e) {
      console.error(e);
      extensionError = e;
    }

    if (injectedExtension === undefined) {
      setExtensionStatus("no_extension");
      return Promise.reject(extensionError);
    }

    setExtensionStatus("connected");
    localStorage.setItem("wallet-id", walletId);
    setInjectedExtension(injectedExtension as InjectedExtension);

    for (let i = 0; i < supportedParachains.length; i++) {
      const { chainId } = supportedParachains[i];
      const { prefix } = ParachainNetworks[chainId];

      try {
        let accounts = await injectedExtension.accounts.get();
        if (accounts === undefined)
          throw new Error("Unable to fetch accounts from extension.");
        accounts = mapAccounts(walletId, accounts, prefix);
        if (accounts === undefined)
          throw new Error("Unable to fetch accounts from extension.");

        setParachainProviders((s) => {
          s[chainId].accounts = (accounts as InjectedAccountWithMeta[]).map(
            (x, _i) => {
              const regexMatch = x.address.match(truncate_regex);
              const nameFallback = regexMatch
                ? `${regexMatch[1]}...${regexMatch[2]}`
                : x.address;
              return {
                address: x.address,
                name: x.meta.name ?? nameFallback,
              };
            }
          );
          return { ...s };
        });

        if (selectDefaultAccount) {
          setSelectedAccount(accounts.length ? 0 : -1);
        }
      } catch (e) {
        console.error(e);
        continue;
      }
    }

    return injectedExtension;
  };

  const deactivate = async (): Promise<void> => {
    setExtensionStatus("initializing");
    setSelectedAccount(-1);
  };

  useEffect(() => {
    createParachainApis(parachainProviders, supportedParachains).then(
      setParachainProviders
    );
    // only called on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedAccount, setSelectedAccount] = useState<number | -1>(-1);

  const signer = useMemo(() => {
    if (extensionInjected) {
      return extensionInjected.signer;
    }
    return undefined;
  }, [extensionInjected]);

  return (
    <DotsamaContext.Provider
      value={{
        signer,
        relaychainProviders,
        parachainProviders,
        setSelectedAccount,
        selectedAccount,
        activate,
        deactivate,
        extensionStatus,
      }}
    >
      {children}
    </DotsamaContext.Provider>
  );
};
