import { FormControl, FormHelperText, FormControlLabel, Checkbox as MuiCheckbox, CheckboxProps as MuiCheckboxProps } from "@mui/material";
import React from "react";
import { Control, Controller, Path } from "react-hook-form";
import { CheckboxIconUnchecked } from "./CheckboxIconUnchecked/CheckboxIconUnchecked";
import { CheckboxIconChecked } from "./CheckboxIconChecked/CheckboxIconChecked";

export interface CheckboxProps extends MuiCheckboxProps {
  label: string | number | React.ReactElement;
  error?: boolean;
  helperText?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  sx,
  error,
  helperText,
  ...props
}) => (
  <FormControl sx={ sx } error={ error }>
    <FormControlLabel
      label={ (
        <>
          { label }
          { helperText && <FormHelperText sx={{ mt: 1 }}>{ helperText }</FormHelperText> }
        </>
) }
      sx={{ alignItems: "flex-start", pt: 1 }}
      control={ (
        <MuiCheckbox
          sx={{ pl: 1.5, pt: 0 }}
          checked={ checked }
          onChange={ onChange }
          icon={ <CheckboxIconUnchecked error={ error } /> }
          checkedIcon={ <CheckboxIconChecked error={ error } /> }
          disableRipple
          { ...props } />
      ) } />

  </FormControl>
);

export type ControlledCheckboxProps<TFieldValues = any, TContext = any> = CheckboxProps & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, TContext>;
};

// eslint-disable-next-line react/function-component-definition
export function ControlledCheckbox<TFieldValues = any, TContext = any>({
  name: parentName,
  control,
  label,
}: ControlledCheckboxProps<TFieldValues, TContext>) {
  return (
    <Controller
      name={ parentName }
      control={ control }
      render={ ({ field: { name, onChange, ref, value, ...field }, fieldState }) => {
        const error = fieldState?.error;

        return (
          <Checkbox
            id={ name }
            name={ name }
            label={ label }
            checked={ !!value }
            onChange={ onChange }
            inputRef={ ref }
            error={ !!error }
            helperText={ error?.message }
            { ...field } />
        );
      } } />
  );
}
