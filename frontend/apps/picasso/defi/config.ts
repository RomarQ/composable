export const DEFI_CONFIG = {
  networkIds: [1, 137, 42161, 43114, 1285, 250] as const, // important
  tokenIds: [
    "eth",
    "matic",
    "avax",
    "weth",
    "usdc",
    "dot",
    "uni",
    "ftm",
    "pica",
    "movr",
    "ksm",
    "xPICA",
    "pablo"
  ] as const, // important
  ammIds: ["uniswap", "sushiswap", "quickswap"] as const
};
