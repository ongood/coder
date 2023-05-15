import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import { makeStyles } from "@mui/styles"
import { License } from "api/typesGenerated"
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog"
import { Stack } from "components/Stack/Stack"
import dayjs from "dayjs"
import { useState } from "react"

type LicenseCardProps = {
  license: License
  userLimitActual?: number
  userLimitLimit?: number
  onRemove: (licenseId: number) => void
  isRemoving: boolean
}

export const LicenseCard = ({
  license,
  userLimitActual,
  userLimitLimit,
  onRemove,
  isRemoving,
}: LicenseCardProps) => {
  const styles = useStyles()

  const [licenseIDMarkedForRemoval, setLicenseIDMarkedForRemoval] = useState<
    number | undefined
  >(undefined)

  return (
    <Paper key={license.id} elevation={2} className={styles.licenseCard}>
      <ConfirmDialog
        type="info"
        hideCancel={false}
        open={licenseIDMarkedForRemoval !== undefined}
        onConfirm={() => {
          if (!licenseIDMarkedForRemoval) {
            return
          }
          onRemove(licenseIDMarkedForRemoval)
          setLicenseIDMarkedForRemoval(undefined)
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
          <Stack direction="column" spacing={0}>
            <span className={styles.secondaryMaincolor}>用户数</span>
            <span className={styles.userLimit}>
              {userLimitActual} {` / ${userLimitLimit || "无限制"}`}
            </span>
          </Stack>

          <Stack direction="column" spacing={0}>
            <span className={styles.secondaryMaincolor}>有效期至</span>
            <span className={styles.licenseExpires}>
              {dayjs
                .unix(license.claims.license_expires)
                .format("YYYY年M月D日")}
            </span>
          </Stack>
          <Button
            className={styles.removeButton}
            variant="text"
            size="small"
            onClick={() => setLicenseIDMarkedForRemoval(license.id)}
          >
            删除
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

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
  secondaryMaincolor: {
    color: theme.palette.text.secondary,
  },
  removeButton: {
    height: "17px",
    minHeight: "17px",
    padding: 0,
    border: "none",
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
}))
