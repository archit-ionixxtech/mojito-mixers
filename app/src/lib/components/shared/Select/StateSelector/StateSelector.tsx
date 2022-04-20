import React, { useCallback, useEffect, useRef } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import {
  EMPTY_OPTION,
  Select,
  SelectOption,
  SelectProps
} from "../../../shared/Select/Select";
import { SelectChangeEvent } from "@mui/material";
import { useCountryOptions } from "../../../../hooks/useCountryOptions";

export interface StateSelectorProps extends Omit<SelectProps, "value" | "options"> {
  value: SelectOption;
  onSelectState: (selectedOption: SelectOption) => void;
  countryCode: string | number;
}

export const StateSelector: React.FC<StateSelectorProps> = ({
  label,
  value,
  disabled,
  onSelectState,
  countryCode,
  ...props
}) => {
  const initRef = useRef(false);

  const { options, optionsMap } = useCountryOptions(countryCode);

  const handleChange = useCallback((e: SelectChangeEvent<string | number>) => {
    onSelectState(optionsMap[e.target.value]);
  }, [optionsMap, onSelectState]);

  const isDisabled = disabled || !countryCode || options.length === 0;

  // If the selected country code changes, we reset the field. Note the useEffect below might not do that, as two
  // different countries might have states with the same code (eg. Andorra and Anguilla):
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;

      return;
    }

    onSelectState(EMPTY_OPTION);
  }, [countryCode, onSelectState]);

  // If the selected option can't be found among the available ones, we reset the field:
  useEffect(() => {
    const stateCode = value.value;

    if (isDisabled || !stateCode) return;

    if (!optionsMap[stateCode]) onSelectState(EMPTY_OPTION);
  }, [value, isDisabled, optionsMap, onSelectState]);

  // If the selected option only has one property set, we try to find a match:
  useEffect(() => {
    const { value: selectedValue, label: selectedLabel } = value;

    if ((selectedValue && selectedLabel) || (!selectedValue && !selectedLabel) || options.length === 0) return;

    const option = selectedValue
      ? optionsMap[selectedValue]
      : options.find((option) => option.label === selectedLabel);

    setTimeout(() => onSelectState(option || EMPTY_OPTION));
  }, [value, optionsMap, options, onSelectState, countryCode]);

  const selectedValue = value.value;

  return (
    <Select
      { ...props }
      // See https://developers.google.com/web/updates/2015/06/checkout-faster-with-autofill:
      autoComplete={ props.autoComplete || "state" }
      label={ label }
      options={ options }
      onChange={ handleChange }
      value={ optionsMap[selectedValue] ? selectedValue : ""}
      disabled={ isDisabled } />
  );
};

export type ControlledStateSelectorProps = Omit<SelectProps, "value" | "options"> & { name: string; control: Control<any>; countryCode: string | number; };

export const ControlledStateSelector: React.FC<ControlledStateSelectorProps> = ({
  name,
  control,
  label,
  countryCode,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { name, onChange, ref, ...field }, fieldState }) => {
      const error = fieldState?.error;
      const fieldError = error ? (error.hasOwnProperty("message") ? error.message : (error as unknown as { value: FieldError }).value?.message) || "" : "";

      return (
        <StateSelector
          id={name}
          name={name}
          label={label}
          onSelectState={onChange}
          fullWidth
          countryCode={countryCode}
          inputRef={ref}
          error={!!fieldError}
          helperText={fieldError}
          {...field}
        />
      );
    }}
  />
);
