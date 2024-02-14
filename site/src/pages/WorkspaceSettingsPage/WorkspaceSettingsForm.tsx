import TextField from "@mui/material/TextField";
import {
  FormFields,
  FormFooter,
  FormSection,
  HorizontalForm,
} from "components/Form/Form";
import { useFormik } from "formik";
import { type FC } from "react";
import * as Yup from "yup";
import {
  nameValidator,
  getFormHelpers,
  onChangeTrimmed,
} from "utils/formUtils";
import {
  AutomaticUpdates,
  AutomaticUpdateses,
  Workspace,
} from "api/typesGenerated";
import MenuItem from "@mui/material/MenuItem";
import upperFirst from "lodash/upperFirst";
import { type Theme } from "@emotion/react";

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
        title="工作区名称"
        description="更新您的工作区名称。"
      >
        <FormFields>
          <TextField
            {...getFieldHelpers("name")}
            disabled={!workspace.allow_renames || form.isSubmitting}
            onChange={onChangeTrimmed(form)}
            autoFocus
            fullWidth
            label="名称"
            css={workspace.allow_renames && styles.nameWarning}
            helperText={
              workspace.allow_renames
                ? form.values.name !== form.initialValues.name &&
                  "根据模板的不同，重命名您的工作区可能会导致数据丢失。"
                : "重命名工作区可能会导致数据丢失，并且未在此部署中启用。"
            }
          />
        </FormFields>
      </FormSection>
      <FormSection
        title="自动更新"
        description="在启动时配置您的工作区自动更新。"
      >
        <FormFields>
          <TextField
            {...getFieldHelpers("automatic_updates")}
            id="automatic_updates"
            label="更新策略"
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
              "此工作区的模板需要自动更新。"
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
        <FormFooter onCancel={onCancel} isLoading={form.isSubmitting} />
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
