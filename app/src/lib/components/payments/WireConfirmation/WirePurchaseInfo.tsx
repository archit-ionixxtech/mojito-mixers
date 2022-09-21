import { Box, Stack, Typography, Avatar } from "@mui/material";
import React, { useCallback } from "react";
import { CheckoutItem } from "../../../domain/product/product.interfaces";
import { PUIDictionarySingleLine } from "../../../domain/dictionary/dictionary.interfaces";


export interface WireCheckoutItemProps {
  name?: string ;
  units?: number ;
  productImageURL?: string ;
}
const WireCheckoutItem: React.FC<WireCheckoutItemProps> = ({ name, productImageURL, units }) => {
  return (
    <Box sx={{ flex: 1, display: "flex" }}>
      <Avatar
        alt={ name }
        src={ productImageURL }
        variant="square"
        sx={{
          width: 80,
          height: 80,
          flex: "0 0 auto",
        }} />

      <Box
        sx={{
          marginLeft: 2,
          marginTop: 0.5,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}>
        <Typography sx={{ fontWeight: "500", pb: 0.25 }} variant="overline">{ name }</Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            mt: 2,
          }}>
          <Typography>Quantity: <Box component="span" sx={{ fontWeight: 500 }}>{ units }</Box></Typography>
        </Box>
      </Box>
    </Box>
  );
};


export interface WireBillingDetailsProps {
  checkoutItems: CheckoutItem[];
  wireConfirmationInstruction: PUIDictionarySingleLine;
}

export const WirePurchaseInfo: React.FC<WireBillingDetailsProps> = ({
  checkoutItems,
  wireConfirmationInstruction,
}) => {
  const renderCheckoutItem = useCallback((item: CheckoutItem) => {
    return <WireCheckoutItem key={ item.name } name={ item.name } productImageURL={ item.imageSrc } units={ item.units } />;
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", padding: 1, pl: 3 }}>
      <Stack
        spacing={ 2 }
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          pt: 1.5,
        }}>
        { checkoutItems.map(renderCheckoutItem) }
      </Stack>

      <Stack sx={{
        pb: { xs: 2.5, sm: 1.5 },
      }}>
        <Stack sx={{ display: "flex", flex: 1, flexDirection: "column", p: 2, mt: 1 }}>
          <Typography sx={{ pt: 1, lineHeight: 3, fontSize: 13 }}>
            Awaiting payment!
          </Typography>
          <Typography component="p" sx={{ lineHeight: 1.5, fontSize: 13, whiteSpace: "pre-line" }}>
            { wireConfirmationInstruction }
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
