import { Box, Grid, Stack, Typography } from "@mui/material";
import React from "react";
import { ReadOnlyField } from "@components/shared/ReadOnlyField/ReadOnlyField";
import { WireInstructions } from "../../../queries/graphqlGenerated";
import { Wallet } from "../../../domain/wallet/wallet.interfaces";
import { filterSpecialWalletAddressValues } from "../../../domain/wallet/wallet.utils";
import { Number } from "../../shared/Number/Number";

interface LabelProps {
  name: string;
  value: string;
}
const Label: React.FC<LabelProps> = ({ name, value }) => {
  return (
    <Stack flexDirection="row" sx={{ mb: 0.25 }}>
      <Typography sx={{ mr: 1, fontWeight: 500 }}>
        { name }:
      </Typography>
      <Typography>
        { value }
      </Typography>
    </Stack>
  );
};


export interface WireBillingDetailsProps {
  wireInstructions: WireInstructions;
  wallet: null | string | Wallet;
  amount: number;
}

export const WireBillingDetails: React.FC<WireBillingDetailsProps> = ({
  wallet, wireInstructions, amount,
}) => {
  const walletAddress = (typeof wallet === "object" ? wallet?.address : filterSpecialWalletAddressValues(wallet)) || "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, position: "relative", padding: 1 }}>
      <Stack
        spacing={ 2 }
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          pt: 2,
        }}>

        <Stack>
          <Typography sx={{ pb: 0.5 }} variant="subtitle2">
            Total Amount
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: "#F9F9F9", px: 1, pr: 4 }}>
            <Number as={ Typography } sx={{ color: "#31A136", fontSize: 20, fontWeight: 500 }} prefix="$">{ amount }</Number>
          </Box>
        </Stack>

        <Stack>
          <Typography sx={{ pb: 0.5 }} variant="subtitle2">
            Status
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: "#F3E9DB", px: 1, pr: 4, py: 1 }}>
            <Typography color="#D57E00">
              Awating Payment
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Stack
        spacing={ 2 }
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          pt: 1.5,
          pb: { xs: 2.5, sm: 1.5 },
        }}>

        <Typography sx={{ pt: 1, fontSize: 13 }}>
          Once minted, items will be deliverted to:
        </Typography>

      </Stack>

      <Stack
        spacing={ 2 }
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          pt: 1.5,
          pb: { xs: 2.5, sm: 1.5 },
        }}>
        <Typography variant="subtitle2">
          Wallet address
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "rgb(249,249,249)", padding: 1 }}>
          <Typography>
            Pacce
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ display: "flex", flexDirection: "column", backgroundColor: "rgb(249,249,249)", padding: 1 }}>
        <Typography>
          { walletAddress }
        </Typography>
      </Box>
      <Stack sx={{
        pt: 3,
        pb: { xs: 2.5, sm: 1.5 },
      }}>
        <Grid
          container
          spacing={ 2 }>
          <Grid item sm={ 6 }>
            <ReadOnlyField
              label="TrackingRef"
              value={ wireInstructions.trackingRef } />
          </Grid>
          <Grid item sm={ 6 }>
            <ReadOnlyField
              label="Bank Name"
              value={ wireInstructions.beneficiary.name } />
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", flex: 1, flexDirection: "column", backgroundColor: "rgb(249,249,249)", p: 2, mt: 1 }}>
          <Label name="Account Number" value={ wireInstructions.beneficiaryBank.accountNumber } />
          <Label name="Routing Number" value={ wireInstructions.beneficiaryBank.routingNumber } />
          <Label name="SwiftCode" value={ wireInstructions.beneficiaryBank.swiftCode } />
        </Box>
      </Stack>
    </Box>
  );
};
