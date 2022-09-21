import { SxProps, Theme } from "@mui/system";
import React from "react";

interface NumberProps {
  as?: React.ElementType;
  sx?: SxProps<Theme>;
  children: number;
  prefix?: string;
  suffix?: string;
}

export const Number: React.FC<NumberProps> = ({
  as: Wrapper = "span",
  sx,
  children,
  prefix = "",
  suffix = "",
}) => {
  const numberFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Wrapper sx={ sx }>{ `${ prefix }${ numberFormat.format(children).replace(/[.,']00$/, "") }${ suffix }` }</Wrapper>
  );
};
