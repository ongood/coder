import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import { makeStyles } from "@mui/styles"
import { AlertBanner } from "components/AlertBanner/AlertBanner"
import { Fieldset } from "components/DeploySettingsLayout/Fieldset"
import { Header } from "components/DeploySettingsLayout/Header"
import { FileUpload } from "components/FileUpload/FileUpload"
import { displayError } from "components/GlobalSnackbar/utils"
import { Stack } from "components/Stack/Stack"
import { DividerWithText } from "pages/DeploySettingsPage/LicensesSettingsPage/DividerWithText"
import { FC } from "react"
import { Link as RouterLink } from "react-router-dom"

type AddNewLicenseProps = {
  onSaveLicenseKey: (license: string) => void
  isSavingLicense: boolean
  savingLicenseError?: unknown
}

export const AddNewLicensePageView: FC<AddNewLicenseProps> = ({
  onSaveLicenseKey,
  isSavingLicense,
  savingLicenseError,
}) => {
  const styles = useStyles()

  function handleFileUploaded(files: File[]) {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const licenseKey = fileReader.result as string

      onSaveLicenseKey(licenseKey)

      fileReader.onerror = () => {
        displayError("读取文件失败")
      }
    }

    fileReader.readAsText(files[0])
  }

  const isUploading = false

  function onUpload(file: File) {
    handleFileUploaded([file])
  }

  return (
    <>
      <Stack
        alignItems="baseline"
        direction="row"
        justifyContent="space-between"
      >
        <Header
          title="添加您的许可证"
          description="企业许可证可以在您的部署中解锁更多功能。"
        />
        <Button component={RouterLink} to="/settings/deployment/licenses">
          返回
        </Button>
      </Stack>

      {savingLicenseError && (
        <AlertBanner severity="error" error={savingLicenseError}></AlertBanner>
      )}

      <FileUpload
        isUploading={isUploading}
        onUpload={onUpload}
        removeLabel="删除文件"
        title="上传您的许可证"
        description="上传一个包含许可证密钥的文本文件"
      />

      <Stack className={styles.main}>
        <DividerWithText>or</DividerWithText>

        <Fieldset
          title="将您的许可证密钥粘贴在这里"
          onSubmit={(e) => {
            e.preventDefault()

            const form = e.target
            const formData = new FormData(form as HTMLFormElement)

            const licenseKey = formData.get("licenseKey")

            onSaveLicenseKey(licenseKey?.toString() || "")
          }}
          button={
            <Button type="submit" disabled={isSavingLicense}>
              添加许可证
            </Button>
          }
        >
          <TextField
            name="licenseKey"
            placeholder="将您的许可证密钥粘贴在这里"
            multiline
            rows={4}
            fullWidth
          />
        </Fieldset>
      </Stack>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  main: {
    paddingTop: theme.spacing(5),
  },
}))
