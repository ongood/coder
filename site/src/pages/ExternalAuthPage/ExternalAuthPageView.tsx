import type { Interpolation, Theme } from "@emotion/react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import AlertTitle from "@mui/material/AlertTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { FC, ReactNode } from "react";
import type { ApiErrorResponse } from "api/errors";
import type { ExternalAuth, ExternalAuthDevice } from "api/typesGenerated";
import { Alert, AlertDetail } from "components/Alert/Alert";
import { Avatar } from "components/Avatar/Avatar";
import { CopyButton } from "components/CopyButton/CopyButton";
import { SignInLayout } from "components/SignInLayout/SignInLayout";
import { Welcome } from "components/Welcome/Welcome";

export interface ExternalAuthPageViewProps {
  externalAuth: ExternalAuth;
  viewExternalAuthConfig: boolean;

  externalAuthDevice?: ExternalAuthDevice;
  deviceExchangeError?: ApiErrorResponse;

  onReauthenticate: () => void;
}

const ExternalAuthPageView: FC<ExternalAuthPageViewProps> = ({
  deviceExchangeError,
  externalAuth,
  externalAuthDevice,
  onReauthenticate,
  viewExternalAuthConfig,
}) => {
  if (!externalAuth.authenticated) {
    return (
      <SignInLayout>
        <Welcome>使用{externalAuth.display_name}进行认证</Welcome>

        {externalAuth.device && (
          <GitDeviceAuth
            deviceExchangeError={deviceExchangeError}
            externalAuthDevice={externalAuthDevice}
          />
        )}
      </SignInLayout>
    );
  }

  const hasInstallations = externalAuth.installations.length > 0;

  // We only want to wrap this with a link if an install URL is available!
  let installTheApp: ReactNode = `安装${externalAuth.display_name}应用`;
  if (externalAuth.app_install_url) {
    installTheApp = (
      <Link
        href={externalAuth.app_install_url}
        target="_blank"
        rel="noreferrer"
      >
        {installTheApp}
      </Link>
    );
  }

  return (
    <SignInLayout>
      <Welcome>
        您已通过 {externalAuth.display_name} 进行身份验证！
      </Welcome>

      <p css={styles.text}>
        {externalAuth.user?.login && `Hey @${externalAuth.user?.login}! 👋`}
        {(!externalAuth.app_installable ||
          externalAuth.installations.length > 0) &&
          "您现在已通过身份验证。 请关闭此窗口！"}
      </p>

      {externalAuth.installations.length > 0 && (
        <div css={styles.authorizedInstalls}>
          {externalAuth.installations.map((install) => {
            if (!install.account) {
              return;
            }
            return (
              <Tooltip key={install.id} title={install.account.login}>
                <Link
                  href={install.account.profile_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Avatar size="sm" src={install.account.avatar_url}>
                    {install.account.login}
                  </Avatar>
                </Link>
              </Tooltip>
            );
          })}
          &nbsp;
          {externalAuth.installations.length} 个组织已被授权
        </div>
      )}

      <div css={styles.links}>
        {!hasInstallations && externalAuth.app_installable && (
          <Alert severity="warning" css={styles.installAlert}>
            您必须{installTheApp}来克隆私有仓库。账户授权后将会显示在这里。
          </Alert>
        )}

        {viewExternalAuthConfig &&
          externalAuth.app_install_url &&
          externalAuth.app_installable && (
            <Link
              href={externalAuth.app_install_url}
              target="_blank"
              rel="noreferrer"
              css={styles.link}
            >
              <OpenInNewIcon fontSize="small" />
              {externalAuth.installations.length > 0
                ? "配置"
                : "安装"}{" "}
              {externalAuth.display_name} 应用
            </Link>
          )}
        <Link
          css={styles.link}
          href="#"
          onClick={() => {
            onReauthenticate();
          }}
        >
          <RefreshIcon /> 重新验证
        </Link>
      </div>
    </SignInLayout>
  );
};

interface GitDeviceAuthProps {
  externalAuthDevice?: ExternalAuthDevice;
  deviceExchangeError?: ApiErrorResponse;
}

const GitDeviceAuth: FC<GitDeviceAuthProps> = ({
  externalAuthDevice,
  deviceExchangeError,
}) => {
  let status = (
    <p css={styles.status}>
      <CircularProgress size={16} color="secondary" data-chromatic="ignore" />
      正在检查认证...
    </p>
  );
  if (deviceExchangeError) {
    // See https://datatracker.ietf.org/doc/html/rfc8628#section-3.5
    switch (deviceExchangeError.detail) {
      case "authorization_pending":
        break;
      case "expired_token":
        status = (
          <Alert severity="error">
            一次性验证码已过期。刷新以获取新的验证码！
          </Alert>
        );
        break;
      case "access_denied":
        status = (
          <Alert severity="error">访问Git提供者被拒绝。</Alert>
        );
        break;
      default:
        status = (
          <Alert severity="error">
            <AlertTitle>{deviceExchangeError.message}</AlertTitle>
            {deviceExchangeError.detail && (
              <AlertDetail>{deviceExchangeError.detail}</AlertDetail>
            )}
          </Alert>
        );
        break;
    }
  }

  // If the error comes from the `externalAuthDevice` query,
  // we cannot even display the user_code.
  if (deviceExchangeError && !externalAuthDevice) {
    return <div>{status}</div>;
  }

  if (!externalAuthDevice) {
    return <CircularProgress />;
  }

  return (
    <div>
      <p css={styles.text}>
        复制您的一次性代码:&nbsp;
        <div css={styles.copyCode}>
          <span css={styles.code}>{externalAuthDevice.user_code}</span>
          &nbsp; <CopyButton text={externalAuthDevice.user_code} />
        </div>
        <br />
        然后打开下面的链接并粘贴它:
      </p>
      <div css={styles.links}>
        <Link
          css={styles.link}
          href={externalAuthDevice.verification_uri}
          target="_blank"
          rel="noreferrer"
        >
          <OpenInNewIcon fontSize="small" />
          打开并粘贴
        </Link>
      </div>

      {status}
    </div>
  );
};

export default ExternalAuthPageView;

const styles = {
  text: (theme) => ({
    fontSize: 16,
    color: theme.palette.text.secondary,
    textAlign: "center",
    lineHeight: "160%",
    margin: 0,
  }),

  copyCode: {
    display: "inline-flex",
    alignItems: "center",
  },

  code: (theme) => ({
    fontWeight: "bold",
    color: theme.palette.text.primary,
  }),

  installAlert: {
    margin: 16,
  },

  links: {
    display: "flex",
    gap: 4,
    margin: 16,
    flexDirection: "column",
  },

  link: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    gap: 8,
  },

  status: (theme) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    color: theme.palette.text.disabled,
  }),

  authorizedInstalls: (theme) => ({
    display: "flex",
    gap: 4,
    color: theme.palette.text.disabled,
    margin: 32,
  }),
} satisfies Record<string, Interpolation<Theme>>;
