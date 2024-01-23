import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import { type FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import { FileUpload } from "components/FileUpload/FileUpload";
import { displayError } from "components/GlobalSnackbar/utils";
import { Stack } from "components/Stack/Stack";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { DividerWithText } from "./DividerWithText";
import { Fieldset } from "../Fieldset";
import { Header } from "../Header";

type AddNewLicenseProps = {
  onSaveLicenseKey: (license: string) => void;
  isSavingLicense: boolean;
  savingLicenseError?: unknown;
};

export const AddNewLicensePageView: FC<AddNewLicenseProps> = ({
  onSaveLicenseKey,
  isSavingLicense,
  savingLicenseError,
}) => {
  function handleFileUploaded(files: File[]) {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const licenseKey = fileReader.result as string;

      onSaveLicenseKey(licenseKey);

      fileReader.onerror = () => {
        displayError("读取文件失败");
      }
    }

    fileReader.readAsText(files[0]);
  }

  const isUploading = false;

  function onUpload(file: File) {
    handleFileUploaded([file]);
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

      <Stack css={{ paddingTop: 40 }}>
        <DividerWithText>or</DividerWithText>

        <Fieldset
          title="将您的许可证密钥粘贴此处"
          onSubmit={(e) => {
            e.preventDefault();

            const form = e.target;
            const formData = new FormData(form as HTMLFormElement);

            const licenseKey = formData.get("licenseKey");

            onSaveLicenseKey(licenseKey?.toString() || "");
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
  );
};
