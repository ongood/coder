import { type Interpolation, type Theme, useTheme } from "@emotion/react";
import AddIcon from "@mui/icons-material/AddOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import type { FC } from "react";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import useWindowSize from "react-use/lib/useWindowSize";
import type { GetLicensesResponse } from "api/api";
import { Stack } from "components/Stack/Stack";
import { Header } from "../Header";
import { LicenseCard } from "./LicenseCard";

type Props = {
  showConfetti: boolean;
  isLoading: boolean;
  userLimitActual?: number;
  userLimitLimit?: number;
  licenses?: GetLicensesResponse[];
  isRemovingLicense: boolean;
  isRefreshing: boolean;
  removeLicense: (licenseId: number) => void;
  refreshEntitlements: () => void;
};

const LicensesSettingsPageView: FC<Props> = ({
  showConfetti,
  isLoading,
  userLimitActual,
  userLimitLimit,
  licenses,
  isRemovingLicense,
  isRefreshing,
  removeLicense,
  refreshEntitlements,
}) => {
  const theme = useTheme();
  const { width, height } = useWindowSize();

  return (
    <>
      <Confetti
        // For some reason this overflows the window and adds scrollbars if we don't subtract here.
        width={width - 1}
        height={height - 1}
        numberOfPieces={showConfetti ? 200 : 0}
        colors={[theme.palette.primary.main, theme.palette.secondary.main]}
      />
      <Stack
        alignItems="baseline"
        direction="row"
        justifyContent="space-between"
      >
        <Header
          title="许可证"
          description="管理许可证以解锁企业版功能。"
        />

        <Stack direction="row" spacing={2}>
          <Button
            component={Link}
            to="/deployment/licenses/add"
            startIcon={<AddIcon />}
          >
            添加许可证
          </Button>
          <Tooltip title="刷新许可权。此操作每10分钟自动进行一次。">
            <LoadingButton
              loadingPosition="start"
              loading={isRefreshing}
              onClick={refreshEntitlements}
              startIcon={<RefreshIcon />}
            >
              刷新
            </LoadingButton>
          </Tooltip>
        </Stack>
      </Stack>

      {isLoading && <Skeleton variant="rectangular" height={200} />}

      {!isLoading && licenses && licenses?.length > 0 && (
        <Stack spacing={4} className="licenses">
          {licenses
            ?.sort(
              (a, b) =>
                new Date(b.claims.license_expires).valueOf() -
                new Date(a.claims.license_expires).valueOf(),
            )
            .map((license) => (
              <LicenseCard
                key={license.id}
                license={license}
                userLimitActual={userLimitActual}
                userLimitLimit={userLimitLimit}
                isRemoving={isRemovingLicense}
                onRemove={removeLicense}
              />
            ))}
        </Stack>
      )}

      {!isLoading && licenses === null && (
        <div css={styles.root}>
          <Stack alignItems="center" spacing={1}>
            <Stack alignItems="center" spacing={0.5}>
              <span css={styles.title}>您没有任何许可证！</span>
              <span css={styles.description}>
                您错过了高可用性、RBAC、配额等很多功能。请联系{" "}
                <MuiLink href="mailto:sales@coder.com">sales</MuiLink> or{" "}
                <MuiLink href="https://coder.com/trial">
                 申请试用许可证
                </MuiLink>{" "}
                 开始使用。
              </span>
            </Stack>
          </Stack>
        </div>
      )}
    </>
  );
};

const styles = {
  title: {
    fontSize: 16,
  },

  root: (theme) => ({
    minHeight: 240,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    padding: 48,
  }),

  description: (theme) => ({
    color: theme.palette.text.secondary,
    textAlign: "center",
    maxWidth: 464,
    marginTop: 8,
  }),
} satisfies Record<string, Interpolation<Theme>>;

export default LicensesSettingsPageView;
