import type { Interpolation, Theme } from "@emotion/react";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { type FormikContextType, type FormikTouched, useFormik } from "formik";
import type { FC } from "react";
import * as Yup from "yup";
import {
  WorkspaceAppSharingLevels,
  type Template,
  type UpdateTemplateMeta,
} from "api/typesGenerated";
import { EnterpriseBadge } from "components/Badges/Badges";
import {
  FormFields,
  FormSection,
  HorizontalForm,
  FormFooter,
} from "components/Form/Form";
import {
  HelpTooltip,
  HelpTooltipContent,
  HelpTooltipText,
  HelpTooltipTrigger,
} from "components/HelpTooltip/HelpTooltip";
import { IconField } from "components/IconField/IconField";
import { Stack } from "components/Stack/Stack";
import {
  getFormHelpers,
  nameValidator,
  templateDisplayNameValidator,
  onChangeTrimmed,
  iconValidator,
} from "utils/formUtils";

const MAX_DESCRIPTION_CHAR_LIMIT = 128;
const MAX_DESCRIPTION_MESSAGE =
  "Please enter a description that is no longer than 128 characters.";

export const getValidationSchema = (): Yup.AnyObjectSchema =>
  Yup.object({
    name: nameValidator("Name"),
    display_name: templateDisplayNameValidator("Display name"),
    description: Yup.string().max(
      MAX_DESCRIPTION_CHAR_LIMIT,
      MAX_DESCRIPTION_MESSAGE,
    ),
    allow_user_cancel_workspace_jobs: Yup.boolean(),
    icon: iconValidator,
    require_active_version: Yup.boolean(),
    deprecation_message: Yup.string(),
    max_port_sharing_level: Yup.string().oneOf(WorkspaceAppSharingLevels),
  });

export interface TemplateSettingsForm {
  template: Template;
  onSubmit: (data: UpdateTemplateMeta) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: unknown;
  // Helpful to show field errors on Storybook
  initialTouched?: FormikTouched<UpdateTemplateMeta>;
  accessControlEnabled: boolean;
  portSharingExperimentEnabled: boolean;
  portSharingControlsEnabled: boolean;
}

export const TemplateSettingsForm: FC<TemplateSettingsForm> = ({
  template,
  onSubmit,
  onCancel,
  error,
  isSubmitting,
  initialTouched,
  accessControlEnabled,
  portSharingExperimentEnabled,
  portSharingControlsEnabled,
}) => {
  const validationSchema = getValidationSchema();
  const form: FormikContextType<UpdateTemplateMeta> =
    useFormik<UpdateTemplateMeta>({
      initialValues: {
        name: template.name,
        display_name: template.display_name,
        description: template.description,
        icon: template.icon,
        allow_user_cancel_workspace_jobs:
          template.allow_user_cancel_workspace_jobs,
        update_workspace_last_used_at: false,
        update_workspace_dormant_at: false,
        require_active_version: template.require_active_version,
        deprecation_message: template.deprecation_message,
        disable_everyone_group_access: false,
        max_port_share_level: template.max_port_share_level,
      },
      validationSchema,
      onSubmit,
      initialTouched,
    });
  const getFieldHelpers = getFormHelpers(form, error);

  return (
    <HorizontalForm
      onSubmit={form.handleSubmit}
      aria-label="Template settings form"
    >
      <FormSection
        title="常规信息"
        description="名称用于在URL和API中标识模板。"
      >
        <FormFields>
          <TextField
            {...getFieldHelpers("name")}
            disabled={isSubmitting}
            onChange={onChangeTrimmed(form)}
            autoFocus
            fullWidth
            label="名称"
          />
        </FormFields>
      </FormSection>

      <FormSection
        title="显示信息"
        description="一个友好的名称、描述和图标，帮助开发者识别您的模板。"
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
            multiline
            disabled={isSubmitting}
            fullWidth
            label="描述"
            rows={2}
          />

          <IconField
            {...getFieldHelpers("icon")}
            disabled={isSubmitting}
            onChange={onChangeTrimmed(form)}
            fullWidth
            label="Icon"
            onPickEmoji={(value) => form.setFieldValue("icon", value)}
          />
        </FormFields>
      </FormSection>

      <FormSection
        title="选项"
        description="管理从该模板创建的工作区上允许的选项。"
      >
        <Stack direction="column" spacing={5}>
          <label htmlFor="allow_user_cancel_workspace_jobs">
            <Stack direction="row" spacing={1}>
              <Checkbox
                id="allow_user_cancel_workspace_jobs"
                name="allow_user_cancel_workspace_jobs"
                disabled={isSubmitting}
                checked={form.values.allow_user_cancel_workspace_jobs}
                onChange={form.handleChange}
              />

              <Stack direction="column" spacing={0.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  css={styles.optionText}
                >
                  允许用户取消进行中的工作区任务。
                  <HelpTooltip>
                    <HelpTooltipTrigger />
                    <HelpTooltipContent>
                      <HelpTooltipText>
                        如果选中，用户可能会破坏他们的工作区。
                      </HelpTooltipText>
                    </HelpTooltipContent>
                  </HelpTooltip>
                </Stack>
                <span css={styles.optionHelperText}>
                  根据您的模板，取消构建可能会使工作区处于不健康状态。对于大多数用例，不建议使用此选项。
                </span>
              </Stack>
            </Stack>
          </label>
          <label htmlFor="require_active_version">
            <Stack direction="row" spacing={1}>
              <Checkbox
                id="require_active_version"
                name="require_active_version"
                checked={form.values.require_active_version}
                onChange={form.handleChange}
              />

              <Stack direction="column" spacing={0.5}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={0.5}
                  css={styles.optionText}
                >
                  在启动时要求工作区自动更新。
                  <HelpTooltip>
                    <HelpTooltipTrigger />
                    <HelpTooltipContent>
                      <HelpTooltipText>
                        此设置对模板管理员不适用。
                      </HelpTooltipText>
                    </HelpTooltipContent>
                  </HelpTooltip>
                </Stack>
                <span css={styles.optionHelperText}>
                  手动启动或自动启动的工作区将使用当前模板的活动版本。
                </span>
              </Stack>
            </Stack>
          </label>
        </Stack>
      </FormSection>

      <FormSection
        title="弃用"
        description="将模板设为弃用会阻止创建新的工作区。现有的工作区将继续正常运行。"
      >
        <FormFields>
          <TextField
            {...getFieldHelpers("deprecation_message", {
              helperText:
                "将消息留空以使模板保持活动状态。 提供的任何消息都会将该模板标记为已弃用。 使用此消息通知用户已弃用以及如何迁移到新模板。",
            })}
            disabled={isSubmitting || !accessControlEnabled}
            fullWidth
            label="弃用消息"
          />
          {!accessControlEnabled && (
            <Stack direction="row">
              <EnterpriseBadge />
              <span css={styles.optionHelperText}>
                Enterprise license required to deprecate templates.
              </span>
            </Stack>
          )}
        </FormFields>
      </FormSection>

      {portSharingExperimentEnabled && (
        <FormSection
          title="Port Sharing"
          description="Shared ports with the Public sharing level can be accessed by anyone,
          while ports with the Authenticated sharing level can only be accessed
          by authenticated Coder users. Ports with the Owner sharing level can
          only be accessed by the workspace owner."
        >
          <FormFields>
            <TextField
              {...getFieldHelpers("max_port_share_level", {
                helperText:
                  "The maximum level of port sharing allowed for workspaces.",
              })}
              disabled={isSubmitting || !portSharingControlsEnabled}
              fullWidth
              select
              value={
                portSharingControlsEnabled
                  ? form.values.max_port_share_level
                  : "public"
              }
              label="Maximum Port Sharing Level"
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="authenticated">Authenticated</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </TextField>
            {!portSharingControlsEnabled && (
              <Stack direction="row">
                <EnterpriseBadge />
                <span css={styles.optionHelperText}>
                  Enterprise license required to control max port sharing level.
                </span>
              </Stack>
            )}
          </FormFields>
        </FormSection>
      )}

      <FormFooter onCancel={onCancel} isLoading={isSubmitting} />
    </HorizontalForm>
  );
};

const styles = {
  optionText: (theme) => ({
    fontSize: 16,
    color: theme.palette.text.primary,
  }),

  optionHelperText: (theme) => ({
    fontSize: 12,
    color: theme.palette.text.secondary,
  }),
} satisfies Record<string, Interpolation<Theme>>;
