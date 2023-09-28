import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { Stack } from "components/Stack/Stack";
import dayjs from "dayjs";
import { useState } from "react";
import { Pill } from "components/Pill/Pill";
import { compareAsc } from "date-fns";
import { GetLicensesResponse } from "api/api";

type LicenseCardProps = {
  license: GetLicensesResponse;
  userLimitActual?: number;
  userLimitLimit?: number;
  onRemove: (licenseId: number) => void;
  isRemoving: boolean;
};

export const LicenseCard = ({
  license,
  userLimitActual,
  userLimitLimit,
  onRemove,
  isRemoving,
}: LicenseCardProps) => {
  const styles = useStyles();

  const [licenseIDMarkedForRemoval, setLicenseIDMarkedForRemoval] = useState<
    number | undefined
  >(undefined);

  const currentUserLimit =
    license.claims.features["user_limit"] || userLimitLimit;

  return (
    <Paper key={license.id} elevation={2} className={styles.licenseCard}>
      <ConfirmDialog
        type="delete"
        hideCancel={false}
        open={licenseIDMarkedForRemoval !== undefined}
        onConfirm={() => {
          if (!licenseIDMarkedForRemoval) {
            return;
          }
          onRemove(licenseIDMarkedForRemoval);
          setLicenseIDMarkedForRemoval(undefined);
        }}
        onClose={() => setLicenseIDMarkedForRemoval(undefined)}
        title="确认删除许可证"
        confirmLoading={isRemoving}
        confirmText="删除"
        description="移除此许可证将禁用所有企业功能。您随时可以添加新的许可证。"
      />
      <Stack
        direction="row"
        spacing={2}
        className={styles.cardContent}
        justifyContent="left"
        alignItems="center"
      >
        <span className={styles.licenseId}>#{license.id}</span>
        <span className={styles.accountType}>
          {license.claims.trial ? "试用" : "企业版"}
        </span>
        <Stack
          direction="row"
          justifyContent="right"
          spacing={8}
          alignItems="self-end"
          style={{
            flex: 1,
          }}
        >
          <Stack direction="column" spacing={0} alignItems="center">
            <span className={styles.secondaryMaincolor}>用户数</span>
            <span className={styles.userLimit}>
              {userLimitActual} {` / ${currentUserLimit || "无限制"}`}
            </span>
          </Stack>
          <Stack
            direction="column"
            spacing={0}
            alignItems="center"
            width="134px" // standardize width of date column
          >
            {compareAsc(
              new Date(license.claims.license_expires * 1000),
              new Date(),
            ) < 1 ? (
              <Pill
                className={styles.expiredBadge}
                text="Expired"
                type="error"
              />
            ) : (
              <span className={styles.secondaryMaincolor}>有效期至</span>
            )}
            <span className={styles.licenseExpires}>
              {dayjs
                .unix(license.claims.license_expires)
                .format("YYYY年M月D日")}
            </span>
          </Stack>
          <Stack spacing={2}>
            <Button
              className={styles.removeButton}
              variant="contained"
              size="small"
              onClick={() => setLicenseIDMarkedForRemoval(license.id)}
            >
              删除&hellip;
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

const useStyles = makeStyles((theme) => ({
  userLimit: {
    color: theme.palette.text.primary,
  },
  licenseCard: {
    ...theme.typography.body2,
    padding: theme.spacing(2),
  },
  cardContent: {},
  licenseId: {
    color: theme.palette.secondary.main,
    fontSize: 18,
    fontWeight: 600,
  },
  accountType: {
    fontWeight: 600,
    fontSize: 18,
    alignItems: "center",
    textTransform: "capitalize",
  },
  licenseExpires: {
    color: theme.palette.text.secondary,
  },
  expiredBadge: {
    marginBottom: theme.spacing(0.5),
  },
  secondaryMaincolor: {
    color: theme.palette.text.secondary,
  },
  removeButton: {
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
}));
