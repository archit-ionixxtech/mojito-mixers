import { Link } from "@mui/material";
import { PUIDictionary } from "./dictionary.interfaces";

export const DEFAULT_DICTIONARY: PUIDictionary = {
  walletInfo: <>
    We will cover gas cost for minting and delivery on both MultiSig and self-hosted wallets.
    Your items will be delivered to your MultiSig wallet by default.
    If you do not have a Mojito MultiSig wallet yet, we will automatically create one for you.
  </>,

  walletMultiSigTooltip: <>
    If you don’t already have a wallet, we will create a <Link href="https://gnosis-safe.io/" target="_blank" rel="noopener noreferrer">Gnosis Safe MultiSig</Link> for you to receive your NFT.
    A MultiSig wallet is used for storing blockchain assets (crypto or NFTs) and enables “multiple signatures” to control access.
    You can transfer your NFTs from your MultiSig wallet to any self-hosted wallet at any time.
  </>,

  wirePaymentsDisclaimer: [<>
    <strong>Third-party wire transfers cannot be accepted. </strong>
    Your bank account name needs to match with the name you used to register in Marketplace.
  </>, <>
    Please note that wire transfers usually take <strong>1-3 business days</strong> to arrive. We
    do not charge any deposit fee — however, your bank may charge you a wire transfer fee.
  </>],

  purchaseInstructions: [
    "After the sale is closed, you’ll receive your NFTs to your chosen wallet.",
  ],
};
