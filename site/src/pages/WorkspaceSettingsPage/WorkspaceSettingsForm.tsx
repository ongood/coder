import type { Theme } from "@emotion/react";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {
	type AutomaticUpdates,
	AutomaticUpdateses,
	type Workspace,
} from "api/typesGenerated";
import { Button } from "components/Button/Button";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "components/Form/Form";
import { Spinner } from "components/Spinner/Spinner";
import { useFormik } from "formik";
import upperFirst from "lodash/upperFirst";
import type { FC } from "react";
import {
	getFormHelpers,
	nameValidator,
	onChangeTrimmed,
} from "utils/formUtils";
import * as Yup from "yup";

const Language = {
	workspaceNameTitle: "工作区名称",
	workspaceNameDescription: "更新您的工作区名称。",
	nameLabel: "名称",
	nameWarning: "根据模板的不同，重命名工作区可能是破坏性的",
	nameDisabled: "重命名工作区可能是破坏性的，已被模板禁用。",
	automaticUpdatesTitle: "自动更新",
	automaticUpdatesDescription: "配置您的工作区在启动时自动更新。",
	updatePolicyLabel: "更新策略",
	templateRequiresUpdates: "此工作区的模板需要自动更新。",
	cancelButton: "取消",
	saveButton: "保存",
};

export type WorkspaceSettingsFormValues = {
	name: string;
	automatic_updates: AutomaticUpdates;
};

interface WorkspaceSettingsFormProps {
	workspace: Workspace;
	error: unknown;
	onCancel: () => void;
	onSubmit: (values: WorkspaceSettingsFormValues) => Promise<void>;
}

export const WorkspaceSettingsForm: FC<WorkspaceSettingsFormProps> = ({
	onCancel,
	onSubmit,
	workspace,
	error,
}) => {
	const formEnabled =
		!workspace.template_require_active_version || workspace.allow_renames;

	const form = useFormik<WorkspaceSettingsFormValues>({
		onSubmit,
		initialValues: {
			name: workspace.name,
			automatic_updates: workspace.automatic_updates,
		},
		validationSchema: Yup.object({
			name: nameValidator("Name"),
			automatic_updates: Yup.string().oneOf(AutomaticUpdateses),
		}),
	});
	const getFieldHelpers = getFormHelpers<WorkspaceSettingsFormValues>(
		form,
		error,
	);

	return (
		<HorizontalForm onSubmit={form.handleSubmit} data-testid="form">
			<FormSection
				title={Language.workspaceNameTitle}
				description={Language.workspaceNameDescription}
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("name")}
						disabled={!workspace.allow_renames || form.isSubmitting}
						onChange={onChangeTrimmed(form)}
						autoFocus
						fullWidth
						label={Language.nameLabel}
						css={workspace.allow_renames && styles.nameWarning}
						helperText={
							workspace.allow_renames
								? form.values.name !== form.initialValues.name &&
									Language.nameWarning
								: Language.nameDisabled
						}
					/>
				</FormFields>
			</FormSection>
			<FormSection
				title={Language.automaticUpdatesTitle}
				description={Language.automaticUpdatesDescription}
			>
				<FormFields>
					<TextField
						{...getFieldHelpers("automatic_updates")}
						id="automatic_updates"
						label={Language.updatePolicyLabel}
						value={
							workspace.template_require_active_version
								? "always"
								: form.values.automatic_updates
						}
						select
						disabled={
							form.isSubmitting || workspace.template_require_active_version
						}
						helperText={
							workspace.template_require_active_version &&
							Language.templateRequiresUpdates
						}
					>
						{AutomaticUpdateses.map((value) => (
							<MenuItem value={value} key={value}>
								{upperFirst(value)}
							</MenuItem>
						))}
					</TextField>
				</FormFields>
			</FormSection>
			{formEnabled && (
				<FormFooter>
					<Button onClick={onCancel} variant="outline">
						{Language.cancelButton}
					</Button>

					<Button type="submit" disabled={form.isSubmitting}>
						<Spinner loading={form.isSubmitting} />
						{Language.saveButton}
					</Button>
				</FormFooter>
			)}
		</HorizontalForm>
	);
};

const styles = {
	nameWarning: (theme: Theme) => ({
		"& .MuiFormHelperText-root": {
			color: theme.palette.warning.light,
		},
	}),
};
