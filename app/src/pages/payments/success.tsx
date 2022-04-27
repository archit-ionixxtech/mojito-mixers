import { GetServerSidePropsContext, GetServerSidePropsResult, NextPage } from "next";
import { useRouter } from "next/router";
import { CheckoutComponent } from "../../components/checkout-component/CheckoutComponent";
import { THREEDS_FLOW_SEARCH_PARAM_SUCCESS_KEY } from "../../lib";
import { CHECKOUT_MODAL_INFO_KEY_PREFIX } from "../../lib/config/config";
import { NOOP } from "../../lib/utils/miscUtils";

const SuccessPage: NextPage = () => {
  const router = useRouter();
  const paymentIdParam = router.query[THREEDS_FLOW_SEARCH_PARAM_SUCCESS_KEY]?.toString();

  return paymentIdParam ? (
    <CheckoutComponent
      loaderMode="success"
      open
      onClose={ NOOP }
      paymentIdParam={ paymentIdParam } />
  ) : null;
}

export default SuccessPage;

export function getServerSideProps(context: GetServerSidePropsContext): GetServerSidePropsResult<Record<string, never>> {
  const paymentIdParam = context.query[THREEDS_FLOW_SEARCH_PARAM_SUCCESS_KEY]?.toString();
  const hasCheckoutModalInfo = context.req.headers.cookie?.includes(`${ CHECKOUT_MODAL_INFO_KEY_PREFIX }${ paymentIdParam }`);

  // TODO: Theses checks could be improved to use the logic in CheckoutOverlay.utils.ts.

  if (hasCheckoutModalInfo) return { props: {} };

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
}
