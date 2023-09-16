import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "components/LoadingButton/LoadingButton";
import { SignInLayout } from "components/SignInLayout/SignInLayout";
import { Stack } from "components/Stack/Stack";
import { Welcome } from "components/Welcome/Welcome";
import { FormikContextType, useFormik } from "formik";
import {
  getFormHelpers,
  nameValidator,
  onChangeTrimmed,
} from "utils/formUtils";
import * as Yup from "yup";
import * as TypesGen from "../../api/typesGenerated";

export const Language = {
  emailLabel: "电子邮件",
  passwordLabel: "密码",
  usernameLabel: "用户名",
  emailInvalid: "请输入有效的电子邮件地址.",
  emailRequired: "请输入电子邮件地址.",
  passwordRequired: "请输入密码.",
  create: "设置帐户",
  welcomeMessage: <>欢迎使用 Coder</>,
}

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email(Language.emailInvalid)
    .required(Language.emailRequired),
  password: Yup.string().required(Language.passwordRequired),
  username: nameValidator(Language.usernameLabel),
});

export interface SetupPageViewProps {
  onSubmit: (firstUser: TypesGen.CreateFirstUserRequest) => void;
  error?: unknown;
  isLoading?: boolean;
}

export const SetupPageView: React.FC<SetupPageViewProps> = ({
  onSubmit,
  error,
  isLoading,
}) => {
  const form: FormikContextType<TypesGen.CreateFirstUserRequest> =
    useFormik<TypesGen.CreateFirstUserRequest>({
      initialValues: {
        email: "",
        password: "",
        username: "",
        trial: true,
      },
      validationSchema,
      onSubmit,
    });
  const getFieldHelpers = getFormHelpers<TypesGen.CreateFirstUserRequest>(
    form,
    error,
  );
  const styles = useStyles();

  return (
    <SignInLayout>
      <Welcome message={Language.welcomeMessage} />
      <form onSubmit={form.handleSubmit}>
        <Stack>
          <TextField
            {...getFieldHelpers("username")}
            onChange={onChangeTrimmed(form)}
            autoComplete="username"
            fullWidth
            label={Language.usernameLabel}
          />
          <TextField
            {...getFieldHelpers("email")}
            onChange={onChangeTrimmed(form)}
            autoComplete="email"
            fullWidth
            label={Language.emailLabel}
          />
          <TextField
            {...getFieldHelpers("password")}
            autoComplete="current-password"
            fullWidth
            id="password"
            label={Language.passwordLabel}
            type="password"
          />
          <div className={styles.callout}>
            <Box display="flex">
              <div>
                <Checkbox
                  id="trial"
                  name="trial"
                  defaultChecked
                  value={form.values.trial}
                  onChange={form.handleChange}
                  data-testid="trial"
                />
              </div>

              <Box>
                <Typography variant="h6" style={{ fontSize: 14 }}>
                  Start a 30-day free trial of Enterprise
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Get access to high availability, template RBAC, audit logging,
                  quotas, and more.
                </Typography>
              </Box>
            </Box>
          </div>
          <LoadingButton
            fullWidth
            loading={isLoading}
            type="submit"
            data-testid="create"
          >
            {Language.create}
          </LoadingButton>
        </Stack>
      </form>
    </SignInLayout>
  );
};

const useStyles = makeStyles(() => ({
  callout: {
    borderRadius: 16,
  },
}));
