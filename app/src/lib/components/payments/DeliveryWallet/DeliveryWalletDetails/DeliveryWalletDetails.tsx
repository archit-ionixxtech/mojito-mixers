import { Box, Chip, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CopyButton } from "../../../shared/CopyButton/CopyButton";
import { ReadOnlyWalletAddress } from "../../../shared/ReadOnlyField/ReadOnlyField";
import React from "react";
import { Wallet } from "../../../../domain/wallet/wallet.interfaces";
import { useDictionary } from "../../../../hooks/useDictionary";

export interface DeliveryWalletDetailsProps {
  wallet: null | string | Wallet;
}
export const DeliveryWalletDetails: React.FC<DeliveryWalletDetailsProps> = ({
  wallet,
}) => {
  const dictionary = useDictionary();
  const walletAddress = (typeof wallet === "object" ? wallet?.address : wallet) || "";
  const isMultiSig = typeof wallet === "object" || !walletAddress;

  return (
    <Box pt={2}>
      <Typography variant="body1">Once minted, items will be delivered to:</Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, mb: walletAddress ? 1 : 0, alignItems: "center" }}>
        <Typography sx={{ fontWeight: "500" }}>{ walletAddress ? "Wallet Address" : "New MultiSig Wallet" }</Typography>

          { isMultiSig && (
            <Tooltip title={ dictionary.walletMultiSigTooltip }>
              <Chip
                variant="outlined"
                size="small"
                color="info"
                label={ (<>
                  MultiSig
                  <InfoOutlinedIcon sx={{ fontSize: "16px", ml: 1 }} />
                </>) } />
            </Tooltip>
          ) }
      </Box>

      { walletAddress && (
        <ReadOnlyWalletAddress
          value={ walletAddress }
          margin="none"
          InputProps={{
            endAdornment: (
              <CopyButton
                label="Wallet Address"
                value={ walletAddress } />
            ),
          }} />
      ) }
    </Box>
  );
}

