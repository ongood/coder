import { useTheme } from "@emotion/react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { type FormikTouched, useFormik } from "formik";
import { type ChangeEvent, type FC, useState, useEffect } from "react";
import type { Template, UpdateTemplateMeta } from "api/typesGenerated";
import {
  FormSection,
  HorizontalForm,
  FormFooter,
  FormFields,
} from "components/Form/Form";
import { Stack } from "components/Stack/Stack";
import { docs } from "utils/docs";
import { getFormHelpers } from "utils/formUtils";
import {
  calculateAutostopRequirementDaysValue,
  type TemplateAutostartRequirementDaysValue,
} from "utils/schedule";
import {
  AutostopRequirementDaysHelperText,
  AutostopRequirementWeeksHelperText,
  convertAutostopRequirementDaysValue,
} from "./AutostopRequirementHelperText";
import {
  getValidationSchema,
  type TemplateScheduleFormValues,
} from "./formHelpers";
import { ScheduleDialog } from "./ScheduleDialog";
import { TemplateScheduleAutostart } from "./TemplateScheduleAutostart";
import {
  ActivityBumpHelperText,
  DefaultTTLHelperText,
  DormancyAutoDeletionTTLHelperText,
  DormancyTTLHelperText,
  FailureTTLHelperText,
  MaxTTLHelperText,
} from "./TTLHelperText";
import {
  useWorkspacesToGoDormant,
  useWorkspacesToBeDeleted,
} from "./useWorkspacesToBeDeleted";

const MS_HOUR_CONVERSION = 3600000;
const MS_DAY_CONVERSION = 86400000;
const FAILURE_CLEANUP_DEFAULT = 7;
const INACTIVITY_CLEANUP_DEFAULT = 180;
const DORMANT_AUTODELETION_DEFAULT = 30;

export interface TemplateScheduleForm {
  template: Template;
  onSubmit: (data: UpdateTemplateMeta) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: unknown;
  allowAdvancedScheduling: boolean;
  // Helpful to show field errors on Storybook
  initialTouched?: FormikTouched<UpdateTemplateMeta>;
}

export const TemplateScheduleForm: FC<TemplateScheduleForm> = ({
  template,
  onSubmit,
  onCancel,
  error,
  allowAdvancedScheduling,
  isSubmitting,
  initialTouched,
}) => {
  const validationSchema = getValidationSchema();
  const form = useFormik<TemplateScheduleFormValues>({
    initialValues: {
      // on display, convert from ms => hours
      default_ttl_ms: template.default_ttl_ms / MS_HOUR_CONVERSION,
      activity_bump_ms: template.activity_bump_ms / MS_HOUR_CONVERSION,
      // the API ignores these values, but to avoid tripping up validation set
      // it to zero if the user can't set the field.
      use_max_ttl:
        template.use_max_ttl === undefined
          ? template.max_ttl_ms > 0
          : template.use_max_ttl,
      max_ttl_ms: allowAdvancedScheduling
        ? template.max_ttl_ms / MS_HOUR_CONVERSION
        : 0,
      failure_ttl_ms: allowAdvancedScheduling
        ? template.failure_ttl_ms / MS_DAY_CONVERSION
        : 0,
      time_til_dormant_ms: allowAdvancedScheduling
        ? template.time_til_dormant_ms / MS_DAY_CONVERSION
        : 0,
      time_til_dormant_autodelete_ms: allowAdvancedScheduling
        ? template.time_til_dormant_autodelete_ms / MS_DAY_CONVERSION
        : 0,

      autostop_requirement_days_of_week: allowAdvancedScheduling
        ? convertAutostopRequirementDaysValue(
            template.autostop_requirement.days_of_week,
          )
        : "off",
      autostop_requirement_weeks: allowAdvancedScheduling
        ? template.autostop_requirement.weeks > 0
          ? template.autostop_requirement.weeks
          : 1
        : 1,
      autostart_requirement_days_of_week: template.autostart_requirement
        .days_of_week as TemplateAutostartRequirementDaysValue[],

      allow_user_autostart: template.allow_user_autostart,
      allow_user_autostop: template.allow_user_autostop,
      failure_cleanup_enabled:
        allowAdvancedScheduling && Boolean(template.failure_ttl_ms),
      inactivity_cleanup_enabled:
        allowAdvancedScheduling && Boolean(template.time_til_dormant_ms),
      dormant_autodeletion_cleanup_enabled:
        allowAdvancedScheduling &&
        Boolean(template.time_til_dormant_autodelete_ms),
      update_workspace_last_used_at: false,
      update_workspace_dormant_at: false,
      require_active_version: false,
      disable_everyone_group_access: false,
    },
    validationSchema,
    onSubmit: () => {
      const dormancyChanged =
        form.initialValues.time_til_dormant_ms !==
        form.values.time_til_dormant_ms;
      const deletionChanged =
        form.initialValues.time_til_dormant_autodelete_ms !==
        form.values.time_til_dormant_autodelete_ms;

      const dormancyScheduleChanged =
        form.values.inactivity_cleanup_enabled &&
        dormancyChanged &&
        workspacesToDormancyInWeek &&
        workspacesToDormancyInWeek.length > 0;

      const deletionScheduleChanged =
        form.values.inactivity_cleanup_enabled &&
        deletionChanged &&
        workspacesToBeDeletedInWeek &&
        workspacesToBeDeletedInWeek.length > 0;

      if (dormancyScheduleChanged || deletionScheduleChanged) {
        setIsScheduleDialogOpen(true);
      } else {
        submitValues();
      }
    },
    initialTouched,
    enableReinitialize: true,
  });

  const getFieldHelpers = getFormHelpers<TemplateScheduleFormValues>(
    form,
    error,
  );
  const theme = useTheme();

  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(now.getDate() + 7);

  const workspacesToDormancyNow = useWorkspacesToGoDormant(
    template,
    form.values,
    now,
  );

  const workspacesToDormancyInWeek = useWorkspacesToGoDormant(
    template,
    form.values,
    weekFromNow,
  );

  const workspacesToBeDeletedNow = useWorkspacesToBeDeleted(
    template,
    form.values,
    now,
  );

  const workspacesToBeDeletedInWeek = useWorkspacesToBeDeleted(
    template,
    form.values,
    weekFromNow,
  );

  const showScheduleDialog =
    workspacesToDormancyNow &&
    workspacesToBeDeletedNow &&
    workspacesToDormancyInWeek &&
    workspacesToBeDeletedInWeek &&
    (workspacesToDormancyInWeek.length > 0 ||
      workspacesToBeDeletedInWeek.length > 0);

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] =
    useState<boolean>(false);

  const submitValues = () => {
    const autostop_requirement_weeks = ["saturday", "sunday"].includes(
      form.values.autostop_requirement_days_of_week,
    )
      ? form.values.autostop_requirement_weeks
      : 1;

    // on submit, convert from hours => ms
    onSubmit({
      default_ttl_ms: form.values.default_ttl_ms
        ? form.values.default_ttl_ms * MS_HOUR_CONVERSION
        : undefined,
      activity_bump_ms: form.values.activity_bump_ms
        ? form.values.activity_bump_ms * MS_HOUR_CONVERSION
        : undefined,
      max_ttl_ms:
        form.values.max_ttl_ms && form.values.use_max_ttl
          ? form.values.max_ttl_ms * MS_HOUR_CONVERSION
          : undefined,
      failure_ttl_ms: form.values.failure_ttl_ms
        ? form.values.failure_ttl_ms * MS_DAY_CONVERSION
        : undefined,
      time_til_dormant_ms: form.values.time_til_dormant_ms
        ? form.values.time_til_dormant_ms * MS_DAY_CONVERSION
        : undefined,
      time_til_dormant_autodelete_ms: form.values.time_til_dormant_autodelete_ms
        ? form.values.time_til_dormant_autodelete_ms * MS_DAY_CONVERSION
        : undefined,

      autostop_requirement: form.values.use_max_ttl
        ? undefined
        : {
            days_of_week: calculateAutostopRequirementDaysValue(
              form.values.autostop_requirement_days_of_week,
            ),
            weeks: autostop_requirement_weeks,
          },
      autostart_requirement: {
        days_of_week: form.values.autostart_requirement_days_of_week,
      },

      allow_user_autostart: form.values.allow_user_autostart,
      allow_user_autostop: form.values.allow_user_autostop,
      update_workspace_last_used_at: form.values.update_workspace_last_used_at,
      update_workspace_dormant_at: form.values.update_workspace_dormant_at,
      require_active_version: false,
      disable_everyone_group_access: false,
    });
  };

  // Set autostop_requirement weeks to 1 when days_of_week is set to "off" or
  // "daily". Technically you can set weeks to a different value in the backend
  // and it will work, but this is a UX decision so users don't set days=daily
  // and weeks=2 and get confused when workspaces only restart daily during
  // every second week.
  //
  // We want to set the value to 1 when the user selects "off" or "daily"
  // because the input gets disabled so they can't change it to 1 themselves.
  const { values: currentValues, setValues } = form;
  useEffect(() => {
    if (
      !["saturday", "sunday"].includes(
        currentValues.autostop_requirement_days_of_week,
      ) &&
      currentValues.autostop_requirement_weeks !== 1
    ) {
      // This is async but we don't really need to await the value.
      void setValues({
        ...currentValues,
        autostop_requirement_weeks: 1,
      });
    }
  }, [currentValues, setValues]);

  const handleToggleFailureCleanup = async (e: ChangeEvent) => {
    form.handleChange(e);
    if (!form.values.failure_cleanup_enabled) {
      // fill failure_ttl_ms with defaults
      await form.setValues({
        ...form.values,
        failure_cleanup_enabled: true,
        failure_ttl_ms: FAILURE_CLEANUP_DEFAULT,
      });
    } else {
      // clear failure_ttl_ms
      await form.setValues({
        ...form.values,
        failure_cleanup_enabled: false,
        failure_ttl_ms: 0,
      });
    }
  };

  const handleToggleInactivityCleanup = async (e: ChangeEvent) => {
    form.handleChange(e);
    if (!form.values.inactivity_cleanup_enabled) {
      // fill time_til_dormant_ms with defaults
      await form.setValues({
        ...form.values,
        inactivity_cleanup_enabled: true,
        time_til_dormant_ms: INACTIVITY_CLEANUP_DEFAULT,
      });
    } else {
      // clear time_til_dormant_ms
      await form.setValues({
        ...form.values,
        inactivity_cleanup_enabled: false,
        time_til_dormant_ms: 0,
      });
    }
  };

  const handleToggleDormantAutoDeletion = async (e: ChangeEvent) => {
    form.handleChange(e);
    if (!form.values.dormant_autodeletion_cleanup_enabled) {
      // fill failure_ttl_ms with defaults
      await form.setValues({
        ...form.values,
        dormant_autodeletion_cleanup_enabled: true,
        time_til_dormant_autodelete_ms: DORMANT_AUTODELETION_DEFAULT,
      });
    } else {
      // clear failure_ttl_ms
      await form.setValues({
        ...form.values,
        dormant_autodeletion_cleanup_enabled: false,
        time_til_dormant_autodelete_ms: 0,
      });
    }
  };

  const handleToggleUseMaxTTL = async () => {
    const val = !form.values.use_max_ttl;
    if (val) {
      // set max_ttl to 1, set autostop_requirement to empty
      await form.setValues({
        ...form.values,
        use_max_ttl: val,
        max_ttl_ms: 1,
        autostop_requirement_days_of_week: "off",
        autostop_requirement_weeks: 1,
      });
    } else {
      // set max_ttl to 0
      await form.setValues({
        ...form.values,
        use_max_ttl: val,
        max_ttl_ms: 0,
      });
    }
  };

  return (
    <HorizontalForm
      onSubmit={form.handleSubmit}
      aria-label="模板设置表单"
    >
      <FormSection
        title="日程"
        description="定义从此模板创建的工作区何时停止。"
      >
        <Stack direction="row" css={styles.ttlFields}>
          <TextField
            {...getFieldHelpers("default_ttl_ms", {
              helperText: (
                <DefaultTTLHelperText ttl={form.values.default_ttl_ms} />
              ),
            })}
            disabled={isSubmitting}
            fullWidth
            inputProps={{ min: 0, step: 1 }}
            label="默认自动停止 (小时)"
            type="number"
          />

          <TextField
            {...getFieldHelpers("activity_bump_ms", {
              helperText: (
                <ActivityBumpHelperText bump={form.values.activity_bump_ms} />
              ),
            })}
            disabled={isSubmitting}
            fullWidth
            inputProps={{ min: 0, step: 1 }}
            label="活动延迟(小时)"
            type="number"
          />
        </Stack>
      </FormSection>

      <FormSection
        title="自动停止规定"
        description="定义从此模板创建的工作区定期停止的条件，以强制执行模板更新并确保闲置工作区被停止。"
      >
        <Stack direction="row" css={styles.ttlFields}>
          <TextField
            {...getFieldHelpers("autostop_requirement_days_of_week", {
              helperText: (
                <AutostopRequirementDaysHelperText
                  days={form.values.autostop_requirement_days_of_week}
                />
              ),
            })}
            disabled={isSubmitting || form.values.use_max_ttl}
            fullWidth
            select
            value={form.values.autostop_requirement_days_of_week}
            label="必须停止的日期"
          >
            <MenuItem key="off" value="off">
              关闭
            </MenuItem>
            <MenuItem key="daily" value="daily">
              每天
            </MenuItem>
            <MenuItem key="saturday" value="saturday">
              周六
            </MenuItem>
            <MenuItem key="sunday" value="sunday">
              周日
            </MenuItem>
          </TextField>

          <TextField
            {...getFieldHelpers("autostop_requirement_weeks", {
              helperText: (
                <AutostopRequirementWeeksHelperText
                  days={form.values.autostop_requirement_days_of_week}
                  weeks={form.values.autostop_requirement_weeks}
                />
              ),
            })}
            disabled={
              isSubmitting ||
              form.values.use_max_ttl ||
              !["saturday", "sunday"].includes(
                form.values.autostop_requirement_days_of_week || "",
              )
            }
            fullWidth
            inputProps={{ min: 1, max: 16, step: 1 }}
            label="自动停止间隔周数"
            type="number"
          />
        </Stack>
      </FormSection>

      <FormSection
        title="最大生命周期"
        description="定义从此模板创建的工作区的最大生命周期。"
        deprecated
      >
        <Stack direction="column" spacing={4}>
          <Stack direction="row" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  id="use_max_ttl"
                  size="small"
                  disabled={isSubmitting || !allowAdvancedScheduling}
                  onChange={handleToggleUseMaxTTL}
                  name="use_max_ttl"
                  checked={form.values.use_max_ttl}
                />
              }
              label={
                <Stack spacing={0.5}>
                  <strong>
                    使用最大生命周期代替必需的自动停止计划。
                  </strong>
                  <span
                    css={{
                      fontSize: 12,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    使用此模板创建的工作区的最大生命周期，而不是上面配置的自动停止要求。
                  </span>
                </Stack>
              }
            />
          </Stack>

          <TextField
            {...getFieldHelpers("max_ttl_ms", {
              helperText: allowAdvancedScheduling ? (
                <MaxTTLHelperText ttl={form.values.max_ttl_ms} />
              ) : (
                <>
                  您需要企业版许可才能使用它{" "}
                  <Link href={docs("/enterprise")}>了解更多</Link>.
                </>
              ),
            })}
            disabled={
              isSubmitting ||
              !form.values.use_max_ttl ||
              !allowAdvancedScheduling
            }
            fullWidth
            inputProps={{ min: 0, step: 1 }}
            label="最大生命周期（小时）"
            type="number"
          />
        </Stack>
      </FormSection>

      <FormSection
        title="允许用户调度"
        description="允许用户为从此模板创建的工作区设置自定义的自动启动和自动停止等调度选项。"
      >
        <Stack direction="column">
          <Stack direction="row" alignItems="center">
            <Checkbox
              id="allow_user_autostart"
              size="small"
              disabled={isSubmitting || !allowAdvancedScheduling}
              onChange={async () => {
                await form.setFieldValue(
                  "allow_user_autostart",
                  !form.values.allow_user_autostart,
                );
              }}
              name="allow_user_autostart"
              checked={form.values.allow_user_autostart}
            />
            <Stack spacing={0.5}>
              <strong>
                允许用户按计划自动启动工作区。
              </strong>
            </Stack>
          </Stack>
          {allowAdvancedScheduling && (
            <TemplateScheduleAutostart
              enabled={Boolean(form.values.allow_user_autostart)}
              value={form.values.autostart_requirement_days_of_week}
              isSubmitting={isSubmitting}
              onChange={async (
                newDaysOfWeek: TemplateAutostartRequirementDaysValue[],
              ) => {
                await form.setFieldValue(
                  "autostart_requirement_days_of_week",
                  newDaysOfWeek,
                );
              }}
            />
          )}

          <Stack direction="row" alignItems="center">
            <Checkbox
              id="allow-user-autostop"
              size="small"
              disabled={isSubmitting || !allowAdvancedScheduling}
              onChange={async () => {
                await form.setFieldValue(
                  "allow_user_autostop",
                  !form.values.allow_user_autostop,
                );
              }}
              name="allow_user_autostop"
              checked={form.values.allow_user_autostop}
            />
            <Stack spacing={0.5}>
              <strong>
                允许用户为工作区自定义自动停止前的持续时间。
              </strong>
              <span
                css={{
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                }}
              >
                如果设置了此项，工作区将始终使用默认的TTL。无论此设置如何，工作区都只能保持最大生存期。
              </span>
            </Stack>
          </Stack>
        </Stack>
      </FormSection>
      {allowAdvancedScheduling && (
        <>
          <FormSection
            title="失败清理"
            description="启用时，Coder 将尝试在指定天数后停止处于失败状态的工作区。"
          >
            <FormFields>
              <FormControlLabel
                control={
                  <Switch
                    name="failureCleanupEnabled"
                    checked={form.values.failure_cleanup_enabled}
                    onChange={handleToggleFailureCleanup}
                  />
                }
                label="启用失败清理"
              />
              <TextField
                {...getFieldHelpers("failure_ttl_ms", {
                  helperText: (
                    <FailureTTLHelperText ttl={form.values.failure_ttl_ms} />
                  ),
                })}
                disabled={isSubmitting || !form.values.failure_cleanup_enabled}
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                label="清理时间（天）"
                type="number"
              />
            </FormFields>
          </FormSection>
          <FormSection
            title="休眠阈值"
            description="启用时，Coder 将在一段时间内没有连接的情况下将工作区标记为休眠状态。 休眠的工作区可以被自动删除（参见下文），也可以由工作区所有者或管理员手动审查。"
          >
            <FormFields>
              <FormControlLabel
                control={
                  <Switch
                    name="dormancyThreshold"
                    checked={form.values.inactivity_cleanup_enabled}
                    onChange={handleToggleInactivityCleanup}
                  />
                }
                label="启用休眠阈值"
              />
              <TextField
                {...getFieldHelpers("time_til_dormant_ms", {
                  helperText: (
                    <DormancyTTLHelperText
                      ttl={form.values.time_til_dormant_ms}
                    />
                  ),
                })}
                disabled={
                  isSubmitting || !form.values.inactivity_cleanup_enabled
                }
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                label="距离休眠剩余(天数)"
                type="number"
              />
            </FormFields>
          </FormSection>
          <FormSection
            title="休眠自动删除"
            description="启用后，Coder 将在一段时间后永久删除休眠的工作区。一旦工作区被删除，将无法恢复。"
          >
            <FormFields>
              <FormControlLabel
                control={
                  <Switch
                    name="dormancyAutoDeletion"
                    checked={form.values.dormant_autodeletion_cleanup_enabled}
                    onChange={handleToggleDormantAutoDeletion}
                  />
                }
                label="启用休眠自动删除"
              />
              <TextField
                {...getFieldHelpers("time_til_dormant_autodelete_ms", {
                  helperText: (
                    <DormancyAutoDeletionTTLHelperText
                      ttl={form.values.time_til_dormant_autodelete_ms}
                    />
                  ),
                })}
                disabled={
                  isSubmitting ||
                  !form.values.dormant_autodeletion_cleanup_enabled
                }
                fullWidth
                inputProps={{ min: 0, step: "any" }}
                label="自动删除时间（天）"
                type="number"
              />
            </FormFields>
          </FormSection>
        </>
      )}
      {showScheduleDialog && (
        <ScheduleDialog
          onConfirm={() => {
            submitValues();
            setIsScheduleDialogOpen(false);
            // These fields are request-scoped so they should be reset
            // after every submission.
            form
              .setFieldValue("update_workspace_dormant_at", false)
              .catch((error) => {
                throw error;
              });
            form
              .setFieldValue("update_workspace_last_used_at", false)
              .catch((error) => {
                throw error;
              });
          }}
          inactiveWorkspacesToGoDormant={workspacesToDormancyNow.length}
          inactiveWorkspacesToGoDormantInWeek={
            workspacesToDormancyInWeek.length - workspacesToDormancyNow.length
          }
          dormantWorkspacesToBeDeleted={workspacesToBeDeletedNow.length}
          dormantWorkspacesToBeDeletedInWeek={
            workspacesToBeDeletedInWeek.length - workspacesToBeDeletedNow.length
          }
          open={isScheduleDialogOpen}
          onClose={() => {
            setIsScheduleDialogOpen(false);
          }}
          title="工作区调度"
          updateDormantWorkspaces={(update: boolean) =>
            form.setFieldValue("update_workspace_dormant_at", update)
          }
          updateInactiveWorkspaces={(update: boolean) =>
            form.setFieldValue("update_workspace_last_used_at", update)
          }
          dormantValueChanged={
            form.initialValues.time_til_dormant_ms !==
            form.values.time_til_dormant_ms
          }
          deletionValueChanged={
            form.initialValues.time_til_dormant_autodelete_ms !==
            form.values.time_til_dormant_autodelete_ms
          }
        />
      )}

      <FormFooter
        onCancel={onCancel}
        isLoading={isSubmitting}
        submitDisabled={!form.isValid || !form.dirty}
      />
    </HorizontalForm>
  );
};

const styles = {
  ttlFields: {
    width: "100%",
  },
  dayButtons: {
    borderRadius: "0px",
  },
};
