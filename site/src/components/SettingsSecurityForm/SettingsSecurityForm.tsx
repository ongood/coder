import TextField from "@material-ui/core/TextField"
import { FormikContextType, FormikTouched, useFormik } from "formik"
import { FC } from "react"
import * as Yup from "yup"
import { getFormHelpers } from "../../util/formUtils"
import { LoadingButton } from "../LoadingButton/LoadingButton"
import { Stack } from "../Stack/Stack"
import { AlertBanner } from "components/AlertBanner/AlertBanner"

interface SecurityFormValues {
  old_password: string
  password: string
  confirm_password: string
}

export const Language = {
  oldPasswordLabel: "旧密码",
  newPasswordLabel: "新密码",
  confirmPasswordLabel: "确认密码",
  oldPasswordRequired: "需要旧密码",
  newPasswordRequired: "需要新密码",
  confirmPasswordRequired: "需要密码确认",
  passwordMinLength: "密码必须至少为 8 个字符",
  passwordMaxLength: "密码不能超过 64 个字符",
  confirmPasswordMatch: "密码和确认密码必须匹配",
  updatePassword: "更新密码",
}

const validationSchema = Yup.object({
  old_password: Yup.string().trim().required(Language.oldPasswordRequired),
  password: Yup.string()
    .trim()
    .min(8, Language.passwordMinLength)
    .max(64, Language.passwordMaxLength)
    .required(Language.newPasswordRequired),
  confirm_password: Yup.string()
    .trim()
    .test("passwords-match", Language.confirmPasswordMatch, function (value) {
      return (this.parent as SecurityFormValues).password === value
    }),
})

export interface SecurityFormProps {
  isLoading: boolean
  initialValues: SecurityFormValues
  onSubmit: (values: SecurityFormValues) => void
  updateSecurityError?: Error | unknown
  // initialTouched is only used for testing the error state of the form.
  initialTouched?: FormikTouched<SecurityFormValues>
}

export const SecurityForm: FC<SecurityFormProps> = ({
  isLoading,
  onSubmit,
  initialValues,
  updateSecurityError,
  initialTouched,
}) => {
  const form: FormikContextType<SecurityFormValues> =
    useFormik<SecurityFormValues>({
      initialValues,
      validationSchema,
      onSubmit,
      initialTouched,
    })
  const getFieldHelpers = getFormHelpers<SecurityFormValues>(
    form,
    updateSecurityError,
  )

  return (
    <>
      <form onSubmit={form.handleSubmit}>
        <Stack>
          {Boolean(updateSecurityError) && (
            <AlertBanner severity="error" error={updateSecurityError} />
          )}
          <TextField
            {...getFieldHelpers("old_password")}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="old_password"
            fullWidth
            label={Language.oldPasswordLabel}
            variant="outlined"
            type="password"
          />
          <TextField
            {...getFieldHelpers("password")}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="password"
            fullWidth
            label={Language.newPasswordLabel}
            variant="outlined"
            type="password"
          />
          <TextField
            {...getFieldHelpers("confirm_password")}
            InputLabelProps={{
              shrink: true,
            }}
            autoComplete="confirm_password"
            fullWidth
            label={Language.confirmPasswordLabel}
            variant="outlined"
            type="password"
          />

          <div>
            <LoadingButton
              loading={isLoading}
              type="submit"
              variant="contained"
            >
              {isLoading ? "" : Language.updatePassword}
            </LoadingButton>
          </div>
        </Stack>
      </form>
    </>
  )
}
