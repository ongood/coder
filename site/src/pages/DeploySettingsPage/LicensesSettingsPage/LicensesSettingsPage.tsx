import { type FC, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useSearchParams } from "react-router-dom";
import useToggle from "react-use/lib/useToggle";
import { getLicenses, removeLicense } from "api/api";
import { getErrorMessage } from "api/errors";
import { entitlements, refreshEntitlements } from "api/queries/entitlements";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { pageTitle } from "utils/page";
import LicensesSettingsPageView from "./LicensesSettingsPageView";

const LicensesSettingsPage: FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const [confettiOn, toggleConfettiOn] = useToggle(false);
  const entitlementsQuery = useQuery(entitlements());
  const refreshEntitlementsMutation = useMutation(
    refreshEntitlements(queryClient),
  );

  useEffect(() => {
    if (entitlementsQuery.error) {
      displayError(
        getErrorMessage(
          entitlementsQuery.error,
          "Failed to fetch entitlements",
        ),
      );
    }
  }, [entitlementsQuery.error]);

  const { mutate: removeLicenseApi, isLoading: isRemovingLicense } =
    useMutation(removeLicense, {
      onSuccess: () => {
        displaySuccess("成功移除了许可证");
        void queryClient.invalidateQueries(["licenses"]);
      },
      onError: () => {
        displayError("移除许可证失败")
      },
    });

  const { data: licenses, isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: () => getLicenses(),
  });

  useEffect(() => {
    if (success) {
      toggleConfettiOn();
      const timeout = setTimeout(() => {
        toggleConfettiOn(false);
        setSearchParams();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [setSearchParams, success, toggleConfettiOn]);

  return (
    <>
      <Helmet>
        <title>{pageTitle("许可证设置")}</title>
      </Helmet>
      <LicensesSettingsPageView
        showConfetti={confettiOn}
        isLoading={isLoading}
        isRefreshing={refreshEntitlementsMutation.isLoading}
        userLimitActual={entitlementsQuery.data?.features.user_limit.actual}
        userLimitLimit={entitlementsQuery.data?.features.user_limit.limit}
        licenses={licenses}
        isRemovingLicense={isRemovingLicense}
        removeLicense={(licenseId: number) => removeLicenseApi(licenseId)}
        refreshEntitlements={async () => {
          try {
            await refreshEntitlementsMutation.mutateAsync();
            displaySuccess("Successfully removed license");
          } catch (error) {
            displayError(getErrorMessage(error, "Failed to remove license"));
          }
        }}
      />
    </>
  );
};

export default LicensesSettingsPage;
