import React, { useMemo } from "react";
import { Stack, Divider, Typography } from "@mui/material";

import { CheckoutModalFooter } from "@components/payments/CheckoutModalFooter/CheckoutModalFooter";
import { WireBillingDetails } from "@components/payments/WireConfirmation/WireBillingDetails";
import { WirePurchaseInfo } from "@components/payments/WireConfirmation/WirePurchaseInfo";
import { WireInstructions } from "../../queries/graphqlGenerated";
import { Wallet } from "../../domain/wallet/wallet.interfaces";
import { useDictionary } from "../../hooks/useDictionary";
import { CheckoutItem } from "../../domain/product/product.interfaces";


export interface WireConfirmationViewProps {
  checkoutItems: CheckoutItem[];
  wireInstructions: WireInstructions;
  wallet: null | string | Wallet;
  onNext: () => void;
}

export const WireConfirmationView: React.FC<WireConfirmationViewProps> = ({
  checkoutItems,
  wireInstructions,
  wallet,
  onNext,
}) => {
  const {
    wireConfirmationInstruction,
    goToMarketplaceHref,
    goToMarketplaceLabel,
  } = useDictionary();

  const totalAmount = useMemo(() => {
    return checkoutItems.map((item: CheckoutItem) => {
      return item.totalPrice;
    }).reduce((total: number, currentValue: number) => {
      return total + currentValue;
    }, 0);
  }, [checkoutItems]);

  return (
    <Stack
      direction={{ xs: "column" }}
      spacing={{ xs: 3, md: 3.75 }}>
      <Stack
        spacing={ 2 }
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          pt: 2,
        }}>
        <Typography variant="h3">
          Wire instruction
        </Typography>
      </Stack>
      <Stack direction={{ md: "row", xs: "column" }} sx={{ display: "flex", flex: 1 }}>
        <WireBillingDetails wallet={ wallet } wireInstructions={ wireInstructions } amount={ totalAmount } />
        <Stack sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <WirePurchaseInfo wireConfirmationInstruction={ wireConfirmationInstruction }
            checkoutItems={ checkoutItems } />
          <Divider sx={{ display: { xs: "block", md: "none" } }} />
          <Stack sx={{
            justifyContent: "space-between",
            alignItems: { sm: "flex-start" },
            p: 2,
          }}>
            <CheckoutModalFooter
              variant="toMarketplace"
              onSubmitClicked={ onNext }
              submitHref={ goToMarketplaceHref }
              submitLabel={ goToMarketplaceLabel } />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
