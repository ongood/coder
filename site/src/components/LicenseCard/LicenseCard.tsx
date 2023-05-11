import Box from "@mui/material/Box"
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
        description="确定要删除此许可证吗？"
      />
      <Stack
        direction="column"
        className={styles.cardContent}
        justifyContent="space-between"
      >
        <Box className={styles.licenseId}>
          <span>#{license.id}</span>
        </Box>
        <Stack className={styles.accountType}>
          <span>{license.claims.trial ? "试用" : "企业版"}</span>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="self-end"
        >
          <Stack direction="column" spacing={0} className={styles.userLimit}>
            <span className={styles.secondaryMaincolor}>用户数</span>
            <div className={styles.primaryMainColor}>
              <span className={styles.userLimitActual}>{userLimitActual}</span>
              <span className={styles.userLimitLimit}>
                {` / ${userLimitLimit || "无限制"}`}
              </span>
            </div>
          </Stack>

          <Stack direction="column" spacing={0} alignItems="center">
            <span className={styles.secondaryMaincolor}>有效期至</span>
            <span className={styles.primaryMainColor}>
              {dayjs
                .unix(license.claims.license_expires)
                .format("YYYY年M月D日")}
            </span>
          </Stack>
          <div className={styles.actions}>
            <Button
              className={styles.removeButton}
              variant="text"
              size="small"
              onClick={() => setLicenseIDMarkedForRemoval(license.id)}
            >
              删除
            </Button>
          </div>
        </Stack>
      </Stack>
    </Paper>
  )
}

const useStyles = makeStyles((theme) => ({
  userLimit: {
    width: "33%",
  },
  actions: {
    width: "33%",
    textAlign: "right",
  },
  userLimitActual: {
    color: theme.palette.primary.main,
  },
  userLimitLimit: {
    color: theme.palette.secondary.main,
    fontWeight: 600,
  },
  licenseCard: {
    ...theme.typography.body2,
    padding: theme.spacing(2),
  },
  cardContent: {
    minHeight: 100,
  },
  licenseId: {
    color: theme.palette.secondary.main,
    fontWeight: 600,
  },
  accountType: {
    fontWeight: 600,
    fontSize: 24,
    justifyContent: "center",
    alignItems: "center",
    textTransform: "capitalize",
  },
  primaryMainColor: {
    color: theme.palette.primary.main,
  },
  secondaryMaincolor: {
    color: theme.palette.secondary.main,
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
