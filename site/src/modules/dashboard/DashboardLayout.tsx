import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import { type FC, type HTMLAttributes, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Loader } from "components/Loader/Loader";
import { usePermissions } from "contexts/auth/usePermissions";
import { LicenseBanner } from "modules/dashboard/LicenseBanner/LicenseBanner";
import { ServiceBanner } from "modules/dashboard/ServiceBanner/ServiceBanner";
import { dashboardContentBottomPadding } from "theme/constants";
import { docs } from "utils/docs";
import { DeploymentBanner } from "./DeploymentBanner/DeploymentBanner";
import { Navbar } from "./Navbar/Navbar";
import { useUpdateCheck } from "./useUpdateCheck";

export const DashboardLayout: FC = () => {
  const permissions = usePermissions();
  const updateCheck = useUpdateCheck(permissions.viewUpdateCheck);
  const canViewDeployment = Boolean(permissions.viewDeploymentValues);

  return (
    <>
      <ServiceBanner />
      {canViewDeployment && <LicenseBanner />}

      <div
        css={{
          display: "flex",
          minHeight: "100%",
          flexDirection: "column",
        }}
      >
        <Navbar />

        <div
          css={{
            flex: 1,
            paddingBottom: dashboardContentBottomPadding, // Add bottom space since we don't use a footer
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </div>

        <DeploymentBanner />

        <Snackbar
          data-testid="update-check-snackbar"
          open={updateCheck.isVisible}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          ContentProps={{
            sx: (theme) => ({
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              maxWidth: 440,
              flexDirection: "row",
              borderColor: theme.palette.info.light,

              "& .MuiSnackbarContent-message": {
                flex: 1,
              },

              "& .MuiSnackbarContent-action": {
                marginRight: 0,
              },
            }),
          }}
          message={
            <div css={{ display: "flex", gap: 16 }}>
              <InfoOutlined
                css={(theme) => ({
                  fontSize: 16,
                  height: 20, // 20 is the height of the text line so we can align them
                  color: theme.palette.info.light,
                })}
              />
              <p>
                Coder {updateCheck.data?.version} 现在可用。查看{" "}
                <Link href={updateCheck.data?.url}>发行说明</Link> 和{" "}
                <Link href={docs("/admin/upgrade")}>升级说明</Link>{" "}
                获取更多信息。
              </p>
            </div>
          }
          action={
            <Button variant="text" size="small" onClick={updateCheck.dismiss}>
              忽略
            </Button>
          }
        />
      </div>
    </>
  );
};

export const DashboardFullPage: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...attrs
}) => {
  return (
    <div
      {...attrs}
      css={{
        marginBottom: `-${dashboardContentBottomPadding}px`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        flexBasis: 0,
        minHeight: "100%",
      }}
    >
      {children}
    </div>
  );
};
