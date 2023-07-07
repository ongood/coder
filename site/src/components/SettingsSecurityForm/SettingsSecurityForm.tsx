import TextField from "@mui/material/TextField"
import { FormikContextType, useFormik } from "formik"
import { FC } from "react"
import * as Yup from "yup"
import { getFormHelpers } from "../../utils/formUtils"
import { LoadingButton } from "../LoadingButton/LoadingButton"
import { ErrorAlert } from "components/Alert/ErrorAlert"
import { Form, FormFields } from "components/Form/Form"
import { Alert } from "components/Alert/Alert"

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
  disabled: boolean
  isLoading: boolean
  onSubmit: (values: SecurityFormValues) => void
  error?: unknown
}

export const SecurityForm: FC<SecurityFormProps> = ({
  disabled,
  isLoading,
  onSubmit,
  error,
}) => {
  const form: FormikContextType<SecurityFormValues> =
    useFormik<SecurityFormValues>({
      initialValues: {
        old_password: "",
        password: "",
        confirm_password: "",
      },
      validationSchema,
      onSubmit,
    })
  const getFieldHelpers = getFormHelpers<SecurityFormValues>(form, error)

  if (disabled) {
    return (
      <Alert severity="info">
        Password changes are only allowed for password based accounts.
      </Alert>
    )
  }

  return (
    <>
      <Form onSubmit={form.handleSubmit}>
        <FormFields>
          {Boolean(error) && <ErrorAlert error={error} />}
          <TextField
            {...getFieldHelpers("old_password")}
            autoComplete="old_password"
            fullWidth
            label={Language.oldPasswordLabel}
            type="password"
          />
          <TextField
            {...getFieldHelpers("password")}
            autoComplete="password"
            fullWidth
            label={Language.newPasswordLabel}
            type="password"
          />
          <TextField
            {...getFieldHelpers("confirm_password")}
            autoComplete="confirm_password"
            fullWidth
            label={Language.confirmPasswordLabel}
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
        </FormFields>
      </Form>
    </>
  )
}
