import React from "react";
import { CheckoutItem } from "../../../../domain/product/product.interfaces";
export interface CheckoutItemCostBreakdownProps {
    checkoutItems: CheckoutItem[];
}
export declare const CheckoutItemCostBreakdown: React.FC<CheckoutItemCostBreakdownProps>;
