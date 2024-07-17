import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import camelCase from "lodash/camelCase";
import capitalize from "lodash/capitalize";
import type { FC } from "react";
import { useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import type {
  ProvisionerJobLog,
  ProvisionerType,
  Template,
  TemplateExample,
  TemplateVersionVariable,
  VariableValue,
} from "api/typesGenerated";
import {
  HorizontalForm,
  FormSection,
  FormFields,
  FormFooter,
} from "components/Form/Form";
import { IconField } from "components/IconField/IconField";
import { SelectedTemplate } from "pages/CreateWorkspacePage/SelectedTemplate";
import {
  nameValidator,
  getFormHelpers,
  onChangeTrimmed,
  displayNameValidator,
} from "utils/formUtils";
import {
  sortedDays,
  type TemplateAutostartRequirementDaysValue,
  type TemplateAutostopRequirementDaysValue,
} from "utils/schedule";
import { TemplateUpload, type TemplateUploadProps } from "./TemplateUpload";
import { VariableInput } from "./VariableInput";

const MAX_DESCRIPTION_CHAR_LIMIT = 128;

export interface CreateTemplateData {
  name: string;
  display_name: string;
  description: string;
  icon: string;
  default_ttl_hours: number;
  autostart_requirement_days_of_week: TemplateAutostartRequirementDaysValue[];
  autostop_requirement_days_of_week: TemplateAutostopRequirementDaysValue;
  autostop_requirement_weeks: number;
  allow_user_autostart: boolean;
  allow_user_autostop: boolean;
  allow_user_cancel_workspace_jobs: boolean;
  parameter_values_by_name?: Record<string, string>;
  user_variable_values?: VariableValue[];
  allow_everyone_group_access: boolean;
  provisioner_type: ProvisionerType;
}

const validationSchema = Yup.object({
  name: nameValidator("Name"),
  display_name: displayNameValidator("Display name"),
  description: Yup.string().max(
    MAX_DESCRIPTION_CHAR_LIMIT,
    "Please enter a description that is less than or equal to 128 characters.",
  ),
  icon: Yup.string().optional(),
});

const defaultInitialValues: CreateTemplateData = {
  name: "",
  display_name: "",
  description: "",
  icon: "",
  default_ttl_hours: 24,
  // autostop_requirement is an enterprise-only feature, and the server ignores
  // the value if you are not licensed. We hide the form value based on
  // entitlements.
  //
  // Default to requiring restart every Sunday in the user's quiet hours in the
  // user's timezone.
  autostop_requirement_days_of_week: "sunday",
  autostop_requirement_weeks: 1,
  autostart_requirement_days_of_week: sortedDays,
  allow_user_cancel_workspace_jobs: false,
  allow_user_autostart: false,
  allow_user_autostop: false,
  allow_everyone_group_access: true,
  provisioner_type: "terraform",
};

type GetInitialValuesParams = {
  fromExample?: TemplateExample;
  fromCopy?: Template;
  variables?: TemplateVersionVariable[];
  allowAdvancedScheduling: boolean;
  searchParams: URLSearchParams;
};

const getInitialValues = ({
  fromExample,
  fromCopy,
  allowAdvancedScheduling,
  variables,
  searchParams,
}: GetInitialValuesParams) => {
  let initialValues = defaultInitialValues;

  // Will assume the query param has a valid ProvisionerType, as this query param is only used
  // in testing.
  defaultInitialValues.provisioner_type =
    (searchParams.get("provisioner_type") as ProvisionerType) || "terraform";

  if (!allowAdvancedScheduling) {
    initialValues = {
      ...initialValues,
      autostop_requirement_days_of_week: "off",
      autostop_requirement_weeks: 1,
    };
  }

  if (fromExample) {
    initialValues = {
      ...initialValues,
      name: fromExample.id,
      display_name: fromExample.name,
      icon: fromExample.icon,
      description: fromExample.description,
    };
  }

  if (fromCopy) {
    initialValues = {
      ...initialValues,
      ...fromCopy,
      name: `${fromCopy.name}-copy`,
      display_name: fromCopy.display_name
        ? `Copy of ${fromCopy.display_name}`
        : "",
    };
  }

  if (variables) {
    variables.forEach((variable) => {
      if (!initialValues.user_variable_values) {
        initialValues.user_variable_values = [];
      }
      initialValues.user_variable_values.push({
        name: variable.name,
        value: variable.sensitive ? "" : variable.value,
      });
    });
  }

  return initialValues;
};

type CopiedTemplateForm = { copiedTemplate: Template };
type StarterTemplateForm = { starterTemplate: TemplateExample };
type UploadTemplateForm = { upload: TemplateUploadProps };

export type CreateTemplateFormProps = (
  | CopiedTemplateForm
  | StarterTemplateForm
  | UploadTemplateForm
) & {
  onCancel: () => void;
  onSubmit: (data: CreateTemplateData) => void;
  onOpenBuildLogsDrawer: () => void;
  isSubmitting: boolean;
  variables?: TemplateVersionVariable[];
  error?: unknown;
  jobError?: string;
  logs?: ProvisionerJobLog[];
  allowAdvancedScheduling: boolean;
  variablesSectionRef: React.RefObject<HTMLDivElement>;
};

export const CreateTemplateForm: FC<CreateTemplateFormProps> = (props) => {
  const [searchParams] = useSearchParams();
  const {
    onCancel,
    onSubmit,
    onOpenBuildLogsDrawer,
    variables,
    isSubmitting,
    error,
    jobError,
    logs,
    allowAdvancedScheduling,
    variablesSectionRef,
  } = props;

  const form = useFormik<CreateTemplateData>({
    initialValues: getInitialValues({
      allowAdvancedScheduling,
      fromExample:
        "starterTemplate" in props ? props.starterTemplate : undefined,
      fromCopy: "copiedTemplate" in props ? props.copiedTemplate : undefined,
      variables,
      searchParams,
    }),
    validationSchema,
    onSubmit,
  });
  const getFieldHelpers = getFormHelpers<CreateTemplateData>(form, error);

  return (
    <HorizontalForm onSubmit={form.handleSubmit}>
      {/* General info */}
      <FormSection
        title="常规"
        description="该名称用于在 URL 和 API 中标识模板。"
      >
        <FormFields>
          {"starterTemplate" in props && (
            <SelectedTemplate template={props.starterTemplate} />
          )}
          {"copiedTemplate" in props && (
            <SelectedTemplate template={props.copiedTemplate} />
          )}
          {"upload" in props && (
            <TemplateUpload
              {...props.upload}
              onUpload={async (file) => {
                await fillNameAndDisplayWithFilename(file.name, form);
                props.upload.onUpload(file);
              }}
            />
          )}

          <TextField
            {...getFieldHelpers("name")}
            disabled={isSubmitting}
            onChange={onChangeTrimmed(form)}
            autoFocus
            fullWidth
            required
            label="名称"
          />
        </FormFields>
      </FormSection>

      {/* Display info  */}
      <FormSection
        title="显示名称"
        description="一个友好的名称、描述和图标，帮助开发人员识别您的模板。"
      >
        <FormFields>
          <TextField
            {...getFieldHelpers("display_name")}
            disabled={isSubmitting}
            fullWidth
            label="显示名称"
          />

          <TextField
            {...getFieldHelpers("description", {
              maxLength: MAX_DESCRIPTION_CHAR_LIMIT,
            })}
            disabled={isSubmitting}
            rows={5}
            multiline
            fullWidth
            label="描述"
          />

          <IconField
            {...getFieldHelpers("icon")}
            disabled={isSubmitting}
            onChange={onChangeTrimmed(form)}
            fullWidth
            onPickEmoji={(value) => form.setFieldValue("icon", value)}
          />
        </FormFields>
      </FormSection>

      {/* Variables */}
      {variables && variables.length > 0 && (
        <FormSection
          ref={variablesSectionRef}
          title="变量"
          description="输入变量允许您在不更改其源代码的情况下自定义模板。"
        >
          <FormFields>
            {variables.map((variable, index) => (
              <VariableInput
                defaultValue={variable.value}
                variable={variable}
                disabled={isSubmitting}
                key={variable.name}
                onChange={async (value) => {
                  await form.setFieldValue("user_variable_values." + index, {
                    name: variable.name,
                    value,
                  });
                }}
              />
            ))}
          </FormFields>
        </FormSection>
      )}

      <div className="flex items-center">
        <FormFooter
          extraActions={
            logs && (
              <button
                type="button"
                onClick={onOpenBuildLogsDrawer}
                css={(theme) => ({
                  backgroundColor: "transparent",
                  border: 0,
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: "pointer",
                  color: theme.palette.text.secondary,

                  "&:hover": {
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                    color: theme.palette.text.primary,
                  },
                })}
              >
                显示构建日志
              </button>
            )
          }
          onCancel={onCancel}
          isLoading={isSubmitting}
          submitLabel={jobError ? "重试" : "创建模板"}
        />
      </div>
    </HorizontalForm>
  );
};

const fillNameAndDisplayWithFilename = async (
  filename: string,
  form: ReturnType<typeof useFormik<CreateTemplateData>>,
) => {
  const [name, _extension] = filename.split(".");
  await Promise.all([
    form.setFieldValue(
      "name",
      // Camel case will remove special chars and spaces
      camelCase(name).toLowerCase(),
    ),
    form.setFieldValue("display_name", capitalize(name)),
  ]);
};
