import TextField from "@mui/material/TextField";
import { Alert } from "components/Alert/Alert";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Button } from "components/Button/Button";
import { Form, FormFields } from "components/Form/Form";
import { PasswordField } from "components/PasswordField/PasswordField";
import { Spinner } from "components/Spinner/Spinner";
import { type FormikContextType, useFormik } from "formik";
import type { FC } from "react";
import { getFormHelpers } from "utils/formUtils";
import * as Yup from "yup";

interface SecurityFormValues {
	old_password: string;
	password: string;
	confirm_password: string;
}

export const Language = {
	oldPasswordLabel: "旧密码",
	newPasswordLabel: "新密码",
	confirmPasswordLabel: "确认密码",
	oldPasswordRequired: "旧密码是必需的",
	newPasswordRequired: "新密码是必需的",
	confirmPasswordRequired: "密码确认是必需的",
	passwordMinLength: "密码必须至少8个字符",
	passwordMaxLength: "密码不能超过64个字符",
	confirmPasswordMatch: "密码和确认密码必须匹配",
	updatePassword: "更新密码",
};

const validationSchema = Yup.object({
	old_password: Yup.string().trim().required(Language.oldPasswordRequired),
	password: Yup.string().trim().required(Language.newPasswordRequired),
	confirm_password: Yup.string()
		.trim()
		.test("passwords-match", Language.confirmPasswordMatch, function (value) {
			return (this.parent as SecurityFormValues).password === value;
		}),
});

interface SecurityFormProps {
	disabled: boolean;
	isLoading: boolean;
	onSubmit: (values: SecurityFormValues) => void;
	error?: unknown;
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
		});
	const getFieldHelpers = getFormHelpers<SecurityFormValues>(form, error);

	if (disabled) {
		return (
			<Alert severity="info">
				Password changes are only allowed for password based accounts.
			</Alert>
		);
	}

	return (
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
				<PasswordField
					{...getFieldHelpers("password")}
					autoComplete="password"
					fullWidth
					label={Language.newPasswordLabel}
				/>
				<TextField
					{...getFieldHelpers("confirm_password")}
					autoComplete="confirm_password"
					fullWidth
					label={Language.confirmPasswordLabel}
					type="password"
				/>

				<div>
					<Button disabled={isLoading} type="submit">
						<Spinner loading={isLoading} />
						{Language.updatePassword}
					</Button>
				</div>
			</FormFields>
		</Form>
	);
};
