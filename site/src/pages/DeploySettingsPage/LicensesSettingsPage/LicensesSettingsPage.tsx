import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMachine } from "@xstate/react"
import { getLicenses, removeLicense } from "api/api"
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils"
import { FC, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { useSearchParams } from "react-router-dom"
import useToggle from "react-use/lib/useToggle"
import { pageTitle } from "utils/page"
import { entitlementsMachine } from "xServices/entitlements/entitlementsXService"
import LicensesSettingsPageView from "./LicensesSettingsPageView"

const LicensesSettingsPage: FC = () => {
  const queryClient = useQueryClient()
  const [entitlementsState] = useMachine(entitlementsMachine)
  const { entitlements } = entitlementsState.context
  const [searchParams, setSearchParams] = useSearchParams()
  const success = searchParams.get("success")
  const [confettiOn, toggleConfettiOn] = useToggle(false)

  const { mutate: removeLicenseApi, isLoading: isRemovingLicense } =
    useMutation(removeLicense, {
      onSuccess: () => {
        displaySuccess("成功移除了许可证")
        void queryClient.invalidateQueries(["licenses"])
      },
      onError: () => {
        displayError("移除许可证失败")
      },
    })

  const { data: licenses, isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: () => getLicenses(),
  })

  useEffect(() => {
    if (success) {
      toggleConfettiOn()
      const timeout = setTimeout(() => {
        toggleConfettiOn(false)
        setSearchParams()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [setSearchParams, success, toggleConfettiOn])

  return (
    <>
      <Helmet>
        <title>{pageTitle("许可证设置")}</title>
      </Helmet>
      <LicensesSettingsPageView
        showConfetti={confettiOn}
        isLoading={isLoading}
        userLimitActual={entitlements?.features.user_limit.actual}
        userLimitLimit={entitlements?.features.user_limit.limit}
        licenses={licenses}
        isRemovingLicense={isRemovingLicense}
        removeLicense={(licenseId: number) => removeLicenseApi(licenseId)}
      />
    </>
  )
}

export default LicensesSettingsPage
