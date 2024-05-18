import { useFormik } from "formik";
import { type FC, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { API } from "api/api";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { CodeExample } from "components/CodeExample/CodeExample";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { FullPageHorizontalForm } from "components/FullPageForm/FullPageHorizontalForm";
import { displaySuccess, displayError } from "components/GlobalSnackbar/utils";
import { Loader } from "components/Loader/Loader";
import { pageTitle } from "utils/page";
import { CreateTokenForm } from "./CreateTokenForm";
import { type CreateTokenData, NANO_HOUR } from "./utils";

const initialValues: CreateTokenData = {
  name: "",
  lifetime: 30,
};

export const CreateTokenPage: FC = () => {
  const navigate = useNavigate();

  const {
    mutate: saveToken,
    isLoading: isCreating,
    isError: creationFailed,
    isSuccess: creationSuccessful,
    data: newToken,
  } = useMutation(API.createToken);
  const {
    data: tokenConfig,
    isLoading: fetchingTokenConfig,
    isError: tokenFetchFailed,
    error: tokenFetchError,
  } = useQuery({
    queryKey: ["tokenconfig"],
    queryFn: API.getTokenConfig,
  });

  const [formError, setFormError] = useState<unknown>(undefined);

  const onCreateSuccess = () => {
    displaySuccess("Token has been created");
    navigate("/settings/tokens");
  };

  const onCreateError = (error: unknown) => {
    setFormError(error);
    displayError("Failed to create token");
  };

  const form = useFormik<CreateTokenData>({
    initialValues,
    onSubmit: (values) => {
      saveToken(
        {
          lifetime: values.lifetime * 24 * NANO_HOUR,
          token_name: values.name,
          scope: "all", // tokens are currently unscoped
        },
        {
          onError: onCreateError,
        },
      );
    },
  });

  const tokenDescription = (
    <>
      <p>请确保在继续之前复制以下令牌:</p>
      <CodeExample
        secret={false}
        code={newToken?.key ?? ""}
        css={{
          minHeight: "auto",
          userSelect: "all",
          width: "100%",
          marginTop: 24,
        }}
      />
    </>
  );

  if (fetchingTokenConfig) {
    return <Loader />;
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle("创建令牌")}</title>
      </Helmet>
      {tokenFetchFailed && <ErrorAlert error={tokenFetchError} />}
      <FullPageHorizontalForm
        title="创建令牌"
        detail="所有令牌都是无范围的，因此具有完全的资源访问权限。"
      >
        <CreateTokenForm
          form={form}
          maxTokenLifetime={tokenConfig?.max_token_lifetime}
          formError={formError}
          setFormError={setFormError}
          isCreating={isCreating}
          creationFailed={creationFailed}
        />

        <ConfirmDialog
          type="info"
          hideCancel
          title="创建成功"
          description={tokenDescription}
          open={creationSuccessful && Boolean(newToken.key)}
          confirmLoading={isCreating}
          onConfirm={onCreateSuccess}
          onClose={onCreateSuccess}
        />
      </FullPageHorizontalForm>
    </>
  );
};

export default CreateTokenPage;
