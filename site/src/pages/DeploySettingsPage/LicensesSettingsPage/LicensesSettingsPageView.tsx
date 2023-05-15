import Button from "@mui/material/Button"
import { makeStyles, useTheme } from "@mui/styles"
import Skeleton from "@mui/material/Skeleton"
import AddIcon from "@mui/icons-material/AddOutlined"
import { GetLicensesResponse } from "api/api"
import { Header } from "components/DeploySettingsLayout/Header"
import { LicenseCard } from "components/LicenseCard/LicenseCard"
import { Stack } from "components/Stack/Stack"
import { FC } from "react"
import Confetti from "react-confetti"
import { Link } from "react-router-dom"
import useWindowSize from "react-use/lib/useWindowSize"

type Props = {
  showConfetti: boolean
  isLoading: boolean
  userLimitActual?: number
  userLimitLimit?: number
  licenses?: GetLicensesResponse[]
  isRemovingLicense: boolean
  removeLicense: (licenseId: number) => void
}

const LicensesSettingsPageView: FC<Props> = ({
  showConfetti,
  isLoading,
  userLimitActual,
  userLimitLimit,
  licenses,
  isRemovingLicense,
  removeLicense,
}) => {
  const styles = useStyles()
  const { width, height } = useWindowSize()

  const theme = useTheme()

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

        <Button
          component={Link}
          to="/settings/deployment/licenses/add"
          startIcon={<AddIcon />}
        >
          添加许可证
        </Button>
      </Stack>

      {isLoading && <Skeleton variant="rectangular" height={200} />}

      {!isLoading && licenses && licenses?.length > 0 && (
        <Stack spacing={4}>
          {licenses?.map((license) => (
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
        <div className={styles.root}>
          <Stack alignItems="center" spacing={1}>
            <Stack alignItems="center" spacing={0.5}>
              <span className={styles.title}>
                您没有任何许可证！
              </span>
              <span className={styles.description}>
                您错过了高可用性、RBAC、配额等许多功能。请联系 <a href="mailto:sales@coder.com">销售团队</a> 或{" "}
                <a href="https://coder.com/trial">申请试用许可证</a>开始使用。
              </span>
            </Stack>
          </Stack>
        </div>
      )}
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: theme.spacing(2),
  },

  root: {
    minHeight: theme.spacing(30),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(6),
  },

  description: {
    color: theme.palette.text.secondary,
    textAlign: "center",
    maxWidth: theme.spacing(58),
    marginTop: theme.spacing(1),
  },
}))

export default LicensesSettingsPageView
