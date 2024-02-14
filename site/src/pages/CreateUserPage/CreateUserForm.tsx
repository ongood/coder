import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Link from "@mui/material/Link";
import { FormikContextType, useFormik } from "formik";
import { FC } from "react";
import * as Yup from "yup";
import { hasApiFieldErrors, isApiError } from "api/errors";
import * as TypesGen from "api/typesGenerated";
import {
  getFormHelpers,
  nameValidator,
  onChangeTrimmed,
} from "utils/formUtils";
import { FormFooter } from "components/FormFooter/FormFooter";
import { FullPageForm } from "components/FullPageForm/FullPageForm";
import { Stack } from "components/Stack/Stack";
import { ErrorAlert } from "components/Alert/ErrorAlert";

export const Language = {
  emailLabel: "电子邮箱",
  passwordLabel: "密码",
  usernameLabel: "用户名",
  emailInvalid: "请输入一个有效的邮箱地址。",
  emailRequired: "请输入邮箱地址。",
  passwordRequired: "请输入密码",
  createUser: "创建",
  cancel: "取消",
}

export const authMethodLanguage = {
  password: {
    displayName: "Password",
    description: "使用电子邮件地址和密码登录",
  },
  oidc: {
    displayName: "OpenID Connect",
    description: "使用 OpenID Connect 提供程序进行身份验证",
  },
  github: {
    displayName: "Github",
    description: "使用 GitHub OAuth 进行身份验证",
  },
  none: {
    displayName: "None",
    description: (
      <>
        禁用此用户的身份验证 (请参阅{" "}
        <Link
          target="_blank"
          rel="noopener"
          href="https://coder.com/docs/v2/latest/admin/auth#disable-built-in-authentication"
        >
          文档
        </Link>{" "}
        以获取更多详细信息)
      </>
    ),
  },
};

export interface CreateUserFormProps {
  onSubmit: (user: TypesGen.CreateUserRequest) => void;
  onCancel: () => void;
  error?: unknown;
  isLoading: boolean;
  myOrgId: string;
  authMethods?: TypesGen.AuthMethods;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email(Language.emailInvalid)
    .required(Language.emailRequired),
  password: Yup.string().when("login_type", {
    is: "password",
    then: (schema) => schema.required(Language.passwordRequired),
    otherwise: (schema) => schema,
  }),
  username: nameValidator(Language.usernameLabel),
  login_type: Yup.string().oneOf(Object.keys(authMethodLanguage)),
});

export const CreateUserForm: FC<
  React.PropsWithChildren<CreateUserFormProps>
> = ({ onSubmit, onCancel, error, isLoading, myOrgId, authMethods }) => {
  const form: FormikContextType<TypesGen.CreateUserRequest> =
    useFormik<TypesGen.CreateUserRequest>({
      initialValues: {
        email: "",
        password: "",
        username: "",
        organization_id: myOrgId,
        disable_login: false,
        login_type: "",
      },
      validationSchema,
      onSubmit,
    });
  const getFieldHelpers = getFormHelpers<TypesGen.CreateUserRequest>(
    form,
    error,
  );

  const methods = [
    authMethods?.password.enabled && "password",
    authMethods?.oidc.enabled && "oidc",
    authMethods?.github.enabled && "github",
    "none",
  ].filter(Boolean) as Array<keyof typeof authMethodLanguage>;

  return (
    <FullPageForm title="创建用户">
      {isApiError(error) && !hasApiFieldErrors(error) && (
        <ErrorAlert error={error} css={{ marginBottom: 32 }} />
      )}
      <form onSubmit={form.handleSubmit} autoComplete="off">
        <Stack spacing={2.5}>
          <TextField
            {...getFieldHelpers("username")}
            onChange={onChangeTrimmed(form)}
            autoComplete="username"
            autoFocus
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
            {...getFieldHelpers("login_type", {
              helperText: "此用户的身份验证方式",
            })}
            select
            id="login_type"
            data-testid="login-type-input"
            value={form.values.login_type}
            label="登录类型"
            onChange={async (e) => {
              if (e.target.value !== "password") {
                await form.setFieldValue("password", "");
              }
              await form.setFieldValue("login_type", e.target.value);
            }}
            SelectProps={{
              renderValue: (selected: unknown) =>
                authMethodLanguage[selected as keyof typeof authMethodLanguage]
                  ?.displayName ?? "",
            }}
          >
            {methods.map((value) => {
              const language = authMethodLanguage[value];
              return (
                <MenuItem key={value} id={"item-" + value} value={value}>
                  <Stack
                    spacing={0}
                    css={{
                      maxWidth: 400,
                    }}
                  >
                    {language.displayName}
                    <span
                      css={(theme) => ({
                        fontSize: 14,
                        color: theme.palette.text.secondary,
                        wordWrap: "normal",
                        whiteSpace: "break-spaces",
                      })}
                    >
                      {language.description}
                    </span>
                  </Stack>
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            {...getFieldHelpers("password", {
              helperText:
                form.values.login_type !== "password" &&
                "此登录类型无需密码",
            })}
            autoComplete="current-password"
            fullWidth
            id="password"
            data-testid="password-input"
            disabled={form.values.login_type !== "password"}
            label={Language.passwordLabel}
            type="password"
          />
        </Stack>
        <FormFooter onCancel={onCancel} isLoading={isLoading} />
      </form>
    </FullPageForm>
  );
};
