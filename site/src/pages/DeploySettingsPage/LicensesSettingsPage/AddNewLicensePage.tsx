import type { FC } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { API } from "api/api";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { pageTitle } from "utils/page";
import { AddNewLicensePageView } from "./AddNewLicensePageView";

const AddNewLicensePage: FC = () => {
  const navigate = useNavigate();

  const {
    mutate: saveLicenseKeyApi,
    isLoading: isCreating,
    error: savingLicenseError,
  } = useMutation(API.createLicense, {
    onSuccess: () => {
      displaySuccess("成功添加了许可证");
      navigate("/deployment/licenses?success=true");
    },
    onError: () => displayError("保存许可证密钥失败"),
  })

  function saveLicenseKey(licenseKey: string) {
    saveLicenseKeyApi(
      { license: licenseKey },
      {
        onSuccess: () => {
          displaySuccess("成功添加了许可证");
          navigate("/deployment/licenses?success=true");
        },
        onError: () => displayError("保存许可证密钥失败"),
      },
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle("License Settings")}</title>
      </Helmet>

      <AddNewLicensePageView
        isSavingLicense={isCreating}
        savingLicenseError={savingLicenseError}
        onSaveLicenseKey={saveLicenseKey}
      />
    </>
  );
};

export default AddNewLicensePage;
