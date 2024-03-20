import Button from "@mui/material/Button";
import { isAxiosError } from "axios";
import type { FC } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useParams, useSearchParams } from "react-router-dom";
import type { ApiErrorResponse } from "api/errors";
import {
  externalAuthDevice,
  externalAuthProvider,
  exchangeExternalAuthDevice,
} from "api/queries/externalAuth";
import { SignInLayout } from "components/SignInLayout/SignInLayout";
import { Welcome } from "components/Welcome/Welcome";
import { useAuthenticated } from "contexts/auth/RequireAuth";
import ExternalAuthPageView from "./ExternalAuthPageView";

const ExternalAuthPage: FC = () => {
  const { provider } = useParams() as { provider: string };
  const [searchParams] = useSearchParams();
  const { permissions } = useAuthenticated();
  const queryClient = useQueryClient();
  const externalAuthProviderOpts = externalAuthProvider(provider);
  const externalAuthProviderQuery = useQuery({
    ...externalAuthProviderOpts,
    refetchOnWindowFocus: true,
  });

  const externalAuthDeviceQuery = useQuery({
    ...externalAuthDevice(provider),
    enabled:
      Boolean(!externalAuthProviderQuery.data?.authenticated) &&
      Boolean(externalAuthProviderQuery.data?.device),
    refetchOnMount: false,
  });
  const exchangeExternalAuthDeviceQuery = useQuery({
    ...exchangeExternalAuthDevice(
      provider,
      externalAuthDeviceQuery.data?.device_code ?? "",
      queryClient,
    ),
    enabled: Boolean(externalAuthDeviceQuery.data),
    retry: true,
    retryDelay: (externalAuthDeviceQuery.data?.interval || 5) * 1000,
    refetchOnWindowFocus: (query) =>
      query.state.status === "success" ? false : "always",
  });

  if (externalAuthProviderQuery.isLoading || !externalAuthProviderQuery.data) {
    return null;
  }

  let deviceExchangeError: ApiErrorResponse | undefined;
  if (isAxiosError(exchangeExternalAuthDeviceQuery.failureReason)) {
    deviceExchangeError =
      exchangeExternalAuthDeviceQuery.failureReason.response?.data;
  } else if (isAxiosError(externalAuthDeviceQuery.failureReason)) {
    deviceExchangeError = externalAuthDeviceQuery.failureReason.response?.data;
  }

  if (
    !externalAuthProviderQuery.data.authenticated &&
    !externalAuthProviderQuery.data.device
  ) {
    const redirectedParam = searchParams?.get("redirected");
    if (redirectedParam && redirectedParam.toLowerCase() === "true") {
      // The auth flow redirected the user here. If we redirect back to the
      // callback, that resets the flow and we'll end up in an infinite loop.
      // So instead, show an error, as the user expects to be authenticated at
      // this point.
      // TODO: Unsure what to do about the device auth flow, should we also
      // show an error there?
      return (
        <SignInLayout>
          <Welcome>无法验证 oauth 访问令牌</Welcome>

          <p css={{ textAlign: "center" }}>
            尝试从认证流程中验证用户的oauth访问令牌。这种情况可能是由于外部认证提供商配置错误导致的。请确认外部认证验证URL配置正确。
          </p>
          <br />
          <Button
            onClick={() => {
              // Redirect to the auth flow again. *crosses fingers*
              window.location.href = `/external-auth/${provider}/callback`;
            }}
          >
            重试
          </Button>
        </SignInLayout>
      );
    }
    window.location.href = `/external-auth/${provider}/callback`;
    return null;
  }

  return (
    <ExternalAuthPageView
      externalAuth={externalAuthProviderQuery.data}
      onReauthenticate={() => {
        queryClient.setQueryData(externalAuthProviderOpts.queryKey, {
          ...externalAuthProviderQuery.data,
          authenticated: false,
        });
      }}
      viewExternalAuthConfig={permissions.viewExternalAuthConfig}
      deviceExchangeError={deviceExchangeError}
      externalAuthDevice={externalAuthDeviceQuery.data}
    />
  );
};

export default ExternalAuthPage;
