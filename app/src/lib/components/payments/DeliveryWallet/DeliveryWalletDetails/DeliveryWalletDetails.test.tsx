import { render, screen } from "@testing-library/react";
import { DeliveryWalletDetails, DeliveryWalletDetailsProps } from "./DeliveryWalletDetails";

describe("render payment components", () => {

  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: () => { /* Do nothing */ },
    },

  });
  const walletAddress = "0xb794f5ea0ba39494ce839613fffba74279579268";

  let deliveryWalletDetailsProps: DeliveryWalletDetailsProps;

  beforeAll(() => {
    deliveryWalletDetailsProps = {
      dictionary: {
        purchaseInstructions: [],
        walletInfo: [],
        walletMultiSigTooltip: "",
        wirePaymentsDisclaimer: []
      },
      wallet: walletAddress,
    };
  });

  it("render wallet details", async () => {
    render(<DeliveryWalletDetails {...deliveryWalletDetailsProps} />);

    const button = await screen.getByLabelText("Copy Wallet Address");

    button.click();

    expect(screen.queryByText(walletAddress)).toBeInTheDocument();
    expect(screen.getByText("Copied", { exact: false })).toBeInTheDocument();
  })
})
