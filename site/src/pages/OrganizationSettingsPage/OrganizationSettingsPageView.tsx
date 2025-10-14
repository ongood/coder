import TextField from "@mui/material/TextField";
import { isApiValidationError } from "api/errors";
import type {
	Organization,
	UpdateOrganizationRequest,
} from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Button } from "components/Button/Button";
import { DeleteDialog } from "components/Dialogs/DeleteDialog/DeleteDialog";
import {
	FormFields,
	FormFooter,
	FormSection,
	HorizontalForm,
} from "components/Form/Form";
import { IconField } from "components/IconField/IconField";
import {
	SettingsHeader,
	SettingsHeaderTitle,
} from "components/SettingsHeader/SettingsHeader";
import { Spinner } from "components/Spinner/Spinner";
import { useFormik } from "formik";
import { type FC, useState } from "react";
import {
	displayNameValidator,
	getFormHelpers,
	nameValidator,
	onChangeTrimmed,
} from "utils/formUtils";
import * as Yup from "yup";
import { HorizontalContainer, HorizontalSection } from "./Horizontal";

const Language = {
	title: "设置",
	infoTitle: "信息",
	infoDescription: "组织的名称和描述。",
	slugLabel: "Slug",
	displayNameLabel: "显示名称",
	descriptionLabel: "描述",
	saveButton: "保存",
	settingsTitle: "设置",
	settingsDescription: "更改或删除您的组织。",
	deleteWarning: "删除组织是不可逆的。",
	deleteButton: "删除此组织",
};

const MAX_DESCRIPTION_CHAR_LIMIT = 128;
const MAX_DESCRIPTION_MESSAGE = `Please enter a description that is no longer than ${MAX_DESCRIPTION_CHAR_LIMIT} characters.`;

const validationSchema = Yup.object({
	name: nameValidator("Name"),
	display_name: displayNameValidator("Display name"),
	description: Yup.string().max(
		MAX_DESCRIPTION_CHAR_LIMIT,
		MAX_DESCRIPTION_MESSAGE,
	),
});

interface OrganizationSettingsPageViewProps {
	organization: Organization;
	error: unknown;
	onSubmit: (values: UpdateOrganizationRequest) => Promise<void>;
	onDeleteOrganization: () => void;
}

export const OrganizationSettingsPageView: FC<
	OrganizationSettingsPageViewProps
> = ({ organization, error, onSubmit, onDeleteOrganization }) => {
	const form = useFormik<UpdateOrganizationRequest>({
		initialValues: {
			name: organization.name,
			display_name: organization.display_name,
			description: organization.description,
			icon: organization.icon,
		},
		validationSchema,
		onSubmit,
		enableReinitialize: true,
	});
	const getFieldHelpers = getFormHelpers(form, error);

	const [isDeleting, setIsDeleting] = useState(false);

	return (
		<div className="w-full max-w-screen-2xl pb-10">
			<SettingsHeader>
				<SettingsHeaderTitle>{Language.title}</SettingsHeaderTitle>
			</SettingsHeader>

			{Boolean(error) && !isApiValidationError(error) && (
				<div css={{ marginBottom: 32 }}>
					<ErrorAlert error={error} />
				</div>
			)}

			<HorizontalForm
				onSubmit={form.handleSubmit}
				aria-label="Organization settings form"
			>
				<FormSection
					title={Language.infoTitle}
					description={Language.infoDescription}
				>
					<fieldset
						disabled={form.isSubmitting}
						css={{ border: "unset", padding: 0, margin: 0, width: "100%" }}
					>
						<FormFields>
							<TextField
								{...getFieldHelpers("name")}
								onChange={onChangeTrimmed(form)}
								autoFocus
								fullWidth
								label={Language.slugLabel}
							/>
							<TextField
								{...getFieldHelpers("display_name")}
								fullWidth
								label={Language.displayNameLabel}
							/>
							<TextField
								{...getFieldHelpers("description")}
								multiline
								fullWidth
								label={Language.descriptionLabel}
								rows={2}
							/>
							<IconField
								{...getFieldHelpers("icon")}
								onChange={onChangeTrimmed(form)}
								fullWidth
								onPickEmoji={(value) => form.setFieldValue("icon", value)}
							/>
						</FormFields>
					</fieldset>
				</FormSection>

				<FormFooter>
					<Button type="submit" disabled={form.isSubmitting}>
						<Spinner loading={form.isSubmitting} />
						{Language.saveButton}
					</Button>
				</FormFooter>
			</HorizontalForm>

			{!organization.is_default && (
				<HorizontalContainer className="mt-12">
					<HorizontalSection
						title={Language.settingsTitle}
						description={Language.settingsDescription}
					>
						<div className="flex bg-surface-orange items-center justify-between border border-solid border-orange-600 rounded-md p-3 pl-4 gap-2 flex-grow">
							<span>{Language.deleteWarning}</span>
							<Button
								variant="destructive"
								onClick={() => setIsDeleting(true)}
								className="min-w-fit"
							>
								{Language.deleteButton}
							</Button>
						</div>
					</HorizontalSection>
				</HorizontalContainer>
			)}

			<DeleteDialog
				isOpen={isDeleting}
				onConfirm={async () => {
					await onDeleteOrganization();
					setIsDeleting(false);
				}}
				onCancel={() => setIsDeleting(false)}
				entity="organization"
				name={organization.name}
			/>
		</div>
	);
};
