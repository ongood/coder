import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import { makeStyles } from "@mui/styles"
import { Fieldset } from "components/DeploySettingsLayout/Fieldset"
import { Header } from "components/DeploySettingsLayout/Header"
import { FileUpload } from "components/FileUpload/FileUpload"
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft"
import { displayError } from "components/GlobalSnackbar/utils"
import { Stack } from "components/Stack/Stack"
import { DividerWithText } from "pages/DeploySettingsPage/LicensesSettingsPage/DividerWithText"
import { FC } from "react"
import { Link as RouterLink } from "react-router-dom"
import { ErrorAlert } from "components/Alert/ErrorAlert"

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
          title="添加许可证"
          description="获取高可用性、RBAC、配额等功能。"
        />
        <Button
          component={RouterLink}
          startIcon={<KeyboardArrowLeft />}
          to="/deployment/licenses"
        >
          所有许可证
        </Button>
      </Stack>

      {savingLicenseError && <ErrorAlert error={savingLicenseError} />}

      <FileUpload
        isUploading={isUploading}
        onUpload={onUpload}
        removeLabel="删除文件"
        title="上传您的许可"
        description="选择包含许可证密钥的文本文件。"
      />

      <Stack className={styles.main}>
        <DividerWithText>or</DividerWithText>

        <Fieldset
          title="将您的许可证密钥粘贴此处"
          onSubmit={(e) => {
            e.preventDefault()

            const form = e.target
            const formData = new FormData(form as HTMLFormElement)

            const licenseKey = formData.get("licenseKey")

            onSaveLicenseKey(licenseKey?.toString() || "")
          }}
          button={
            <Button type="submit" disabled={isSavingLicense}>
              上传许可证
            </Button>
          }
        >
          <TextField
            name="licenseKey"
            placeholder="输入您的许可证..."
            multiline
            rows={1}
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
