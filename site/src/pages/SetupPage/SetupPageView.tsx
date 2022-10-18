import FormHelperText from "@material-ui/core/FormHelperText"
import TextField from "@material-ui/core/TextField"
import { LoadingButton } from "components/LoadingButton/LoadingButton"
import { SignInLayout } from "components/SignInLayout/SignInLayout"
import { Stack } from "components/Stack/Stack"
import { Welcome } from "components/Welcome/Welcome"
import { FormikContextType, FormikErrors, useFormik } from "formik"
import { getFormHelpers, nameValidator, onChangeTrimmed } from "util/formUtils"
import * as Yup from "yup"
import * as TypesGen from "../../api/typesGenerated"

export const Language = {
  emailLabel: "电子邮件",
  passwordLabel: "密码",
  usernameLabel: "用户名",
  organizationLabel: "组织名称",
  emailInvalid: "请输入有效的电子邮件地址。",
  emailRequired: "请输入电子邮件地址。",
  passwordRequired: "请输入密码。",
  organizationRequired: "请输入组织名称。",
  create: "设置帐户",
  welcomeMessage: (
    <>
      设置 <strong>您的账号</strong>
    </>
  ),
}

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email(Language.emailInvalid)
    .required(Language.emailRequired),
  password: Yup.string().required(Language.passwordRequired),
  organization: Yup.string().required(Language.organizationRequired),
  username: nameValidator(Language.usernameLabel),
})

export interface SetupPageViewProps {
  onSubmit: (firstUser: TypesGen.CreateFirstUserRequest) => void
  formErrors?: FormikErrors<TypesGen.CreateFirstUserRequest>
  genericError?: string
  isLoading?: boolean
}

export const SetupPageView: React.FC<SetupPageViewProps> = ({
  onSubmit,
  formErrors,
  genericError,
  isLoading,
}) => {
  const form: FormikContextType<TypesGen.CreateFirstUserRequest> =
    useFormik<TypesGen.CreateFirstUserRequest>({
      initialValues: {
        email: "",
        password: "",
        username: "",
        organization: "",
      },
      validationSchema,
      onSubmit,
    })
  const getFieldHelpers = getFormHelpers<TypesGen.CreateFirstUserRequest>(
    form,
    formErrors,
  )

  return (
    <SignInLayout>
      <Welcome message={Language.welcomeMessage} />
      <form onSubmit={form.handleSubmit}>
        <Stack>
          <TextField
            {...getFieldHelpers("organization")}
            onChange={onChangeTrimmed(form)}
            autoFocus
            fullWidth
            label={Language.organizationLabel}
            variant="outlined"
          />
          <TextField
            {...getFieldHelpers("username")}
            onChange={onChangeTrimmed(form)}
            autoComplete="username"
            fullWidth
            label={Language.usernameLabel}
            variant="outlined"
          />
          <TextField
            {...getFieldHelpers("email")}
            onChange={onChangeTrimmed(form)}
            autoComplete="email"
            fullWidth
            label={Language.emailLabel}
            variant="outlined"
          />
          <TextField
            {...getFieldHelpers("password")}
            autoComplete="current-password"
            fullWidth
            id="password"
            label={Language.passwordLabel}
            type="password"
            variant="outlined"
          />
          {genericError && (
            <FormHelperText error>{genericError}</FormHelperText>
          )}
          <LoadingButton
            fullWidth
            variant="contained"
            loading={isLoading}
            type="submit"
          >
            {Language.create}
          </LoadingButton>
        </Stack>
      </form>
    </SignInLayout>
  )
}
