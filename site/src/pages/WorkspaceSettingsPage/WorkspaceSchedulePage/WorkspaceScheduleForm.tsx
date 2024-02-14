import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import {
  HorizontalForm,
  FormFooter,
  FormSection,
  FormFields,
} from "components/Form/Form";
import { Stack } from "components/Stack/Stack";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { FormikTouched, useFormik } from "formik";
import {
  defaultSchedule,
  emptySchedule,
} from "pages/WorkspaceSettingsPage/WorkspaceSchedulePage/schedule";
import { type ChangeEvent, type FC } from "react";
import * as Yup from "yup";
import { getFormHelpers } from "utils/formUtils";
import { timeZones } from "utils/timeZones";
import Tooltip from "@mui/material/Tooltip";
import { formatDuration, intervalToDuration } from "date-fns";
import { DisabledBadge } from "components/Badges/Badges";
import { TemplateAutostartRequirement } from "api/typesGenerated";

// REMARK: some plugins depend on utc, so it's listed first. Otherwise they're
//         sorted alphabetically.
dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);

export const Language = {
  errorNoDayOfWeek: "如果自动启动已启用，必须至少设置一天。",
  errorNoTime: "当自动启动已启用时，开始时间是必需的。",
  errorTime: "时间必须以 HH:mm 格式。",
  errorTimezone: "无效的时区。",
  errorNoStop: "当自动停止已启用时，关闭时间必须大于零。",
  errorTtlMax: "请输入小于或等于720小时（30天）的限制。",
  daysOfWeekLabel: "工作日",
  daySundayLabel: "星期日",
  dayMondayLabel: "星期一",
  dayTuesdayLabel: "星期二",
  dayWednesdayLabel: "星期三",
  dayThursdayLabel: "星期四",
  dayFridayLabel: "星期五",
  daySaturdayLabel: "星期六",
  startTimeLabel: "开始时间",
  timezoneLabel: "时区",
  ttlLabel: "自动关闭时间（小时）",
  formTitle: "工作区计划",
  startSection: "启动",
  startSwitch: "启用自动启动",
  stopSection: "停止",
  stopSwitch: "启用自动停止",
};

export interface WorkspaceScheduleFormProps {
  submitScheduleError?: unknown;
  initialValues: WorkspaceScheduleFormValues;
  isLoading: boolean;
  allowedTemplateAutoStartDays: TemplateAutostartRequirement["days_of_week"];
  allowTemplateAutoStop: boolean;
  allowTemplateAutoStart: boolean;
  onCancel: () => void;
  onSubmit: (values: WorkspaceScheduleFormValues) => void;
  // for storybook
  initialTouched?: FormikTouched<WorkspaceScheduleFormValues>;
  defaultTTL: number;
}

export interface WorkspaceScheduleFormValues {
  autostartEnabled: boolean;
  sunday: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  startTime: string;
  timezone: string;

  autostopEnabled: boolean;
  ttl: number;
}

export const validationSchema = Yup.object({
  sunday: Yup.boolean(),
  monday: Yup.boolean().test(
    "at-least-one-day",
    Language.errorNoDayOfWeek,
    function (value) {
      const parent = this.parent as WorkspaceScheduleFormValues;

      if (!parent.autostartEnabled) {
        return true;
      } else {
        return ![
          parent.sunday,
          value,
          parent.tuesday,
          parent.wednesday,
          parent.thursday,
          parent.friday,
          parent.saturday,
        ].every((day) => day === false);
      }
    },
  ),
  tuesday: Yup.boolean(),
  wednesday: Yup.boolean(),
  thursday: Yup.boolean(),
  friday: Yup.boolean(),
  saturday: Yup.boolean(),

  startTime: Yup.string()
    .ensure()
    .test("required-if-autostart", Language.errorNoTime, function (value) {
      const parent = this.parent as WorkspaceScheduleFormValues;
      if (parent.autostartEnabled) {
        return value !== "";
      } else {
        return true;
      }
    })
    .test("is-time-string", Language.errorTime, (value) => {
      if (value === "") {
        return true;
      } else if (!/^[0-9][0-9]:[0-9][0-9]$/.test(value)) {
        return false;
      } else {
        const parts = value.split(":");
        const HH = Number(parts[0]);
        const mm = Number(parts[1]);
        return HH >= 0 && HH <= 23 && mm >= 0 && mm <= 59;
      }
    }),
  timezone: Yup.string()
    .ensure()
    .test("is-timezone", Language.errorTimezone, function (value) {
      const parent = this.parent as WorkspaceScheduleFormValues;

      if (!parent.startTime) {
        return true;
      } else {
        // Unfortunately, there's not a good API on dayjs at this time for
        // evaluating a timezone. Attempt to parse today in the supplied timezone
        // and return as valid if the function doesn't throw.
        try {
          dayjs.tz(dayjs(), value);
          return true;
        } catch (e) {
          return false;
        }
      }
    }),
  ttl: Yup.number()
    .min(0)
    .max(24 * 30 /* 30 days */, Language.errorTtlMax)
    .test("positive-if-autostop", Language.errorNoStop, function (value) {
      const parent = this.parent as WorkspaceScheduleFormValues;
      if (parent.autostopEnabled) {
        return Boolean(value);
      } else {
        return true;
      }
    }),
});

export const WorkspaceScheduleForm: FC<WorkspaceScheduleFormProps> = ({
  submitScheduleError,
  initialValues,
  isLoading,
  onCancel,
  onSubmit,
  initialTouched,
  defaultTTL,
  allowedTemplateAutoStartDays,
  allowTemplateAutoStop,
  allowTemplateAutoStart,
}) => {
  const form = useFormik<WorkspaceScheduleFormValues>({
    initialValues,
    onSubmit,
    validationSchema,
    initialTouched,
    enableReinitialize: true,
  });
  const formHelpers = getFormHelpers<WorkspaceScheduleFormValues>(
    form,
    submitScheduleError,
  );

  const checkboxes: Array<{ value: boolean; name: string; label: string }> = [
    {
      value: form.values.monday,
      name: "monday",
      label: Language.dayMondayLabel,
    },
    {
      value: form.values.tuesday,
      name: "tuesday",
      label: Language.dayTuesdayLabel,
    },
    {
      value: form.values.wednesday,
      name: "wednesday",
      label: Language.dayWednesdayLabel,
    },
    {
      value: form.values.thursday,
      name: "thursday",
      label: Language.dayThursdayLabel,
    },
    {
      value: form.values.friday,
      name: "friday",
      label: Language.dayFridayLabel,
    },
    {
      value: form.values.saturday,
      name: "saturday",
      label: Language.daySaturdayLabel,
    },
    {
      value: form.values.sunday,
      name: "sunday",
      label: Language.daySundayLabel,
    },
  ];

  const handleToggleAutostart = async (e: ChangeEvent) => {
    form.handleChange(e);
    if (form.values.autostartEnabled) {
      // disable autostart, clear values
      await form.setValues({
        ...form.values,
        autostartEnabled: false,
        ...emptySchedule,
      });
    } else {
      // enable autostart, fill with defaults
      await form.setValues({
        ...form.values,
        autostartEnabled: true,
        ...defaultSchedule(),
      });
    }
  };

  const handleToggleAutostop = async (e: ChangeEvent) => {
    form.handleChange(e);
    if (form.values.autostopEnabled) {
      // disable autostop, set TTL 0
      await form.setValues({ ...form.values, autostopEnabled: false, ttl: 0 });
    } else {
      // enable autostop, fill with default TTL
      await form.setValues({
        ...form.values,
        autostopEnabled: true,
        ttl: defaultTTL,
      });
    }
  };

  return (
    <HorizontalForm onSubmit={form.handleSubmit}>
      <FormSection
        title="自动启动"
        description={
          <>
            <div css={{ marginBottom: 16 }}>
              选择您希望工作区自动启动的时间和星期。
            </div>
            {!allowTemplateAutoStart && (
              <Tooltip title="此选项可以在模板设置中启用">
                <DisabledBadge />
              </Tooltip>
            )}
          </>
        }
      >
        <FormFields>
          <FormControlLabel
            control={
              <Switch
                disabled={!allowTemplateAutoStart}
                name="autostartEnabled"
                checked={form.values.autostartEnabled}
                onChange={handleToggleAutostart}
              />
            }
            label={Language.startSwitch}
          />
          <Stack direction="row">
            <TextField
              {...formHelpers("startTime")}
              // disabled if template does not allow autostart
              // or if primary feature is toggled off via the switch above
              disabled={
                isLoading ||
                !allowTemplateAutoStart ||
                !form.values.autostartEnabled
              }
              label={Language.startTimeLabel}
              type="time"
              fullWidth
            />
            <TextField
              {...formHelpers("timezone")}
              // disabled if template does not allow autostart
              // or if primary feature is toggled off via the switch above
              disabled={
                isLoading ||
                !allowTemplateAutoStart ||
                !form.values.autostartEnabled
              }
              label={Language.timezoneLabel}
              select
              fullWidth
            >
              {timeZones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <FormControl component="fieldset" error={Boolean(form.errors.monday)}>
            <FormLabel css={{ fontSize: 12 }} component="legend">
              {Language.daysOfWeekLabel}
            </FormLabel>

            <FormGroup
              css={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                paddingTop: 4,
              }}
            >
              {checkboxes.map((checkbox) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkbox.value}
                      // template admins can disable the autostart feature in general,
                      // or they can disallow autostart on specific days of the week.
                      // also disabled if primary feature switch (above) is toggled off
                      disabled={
                        isLoading ||
                        !allowTemplateAutoStart ||
                        !allowedTemplateAutoStartDays.includes(checkbox.name) ||
                        !form.values.autostartEnabled
                      }
                      onChange={form.handleChange}
                      name={checkbox.name}
                      size="small"
                    />
                  }
                  key={checkbox.name}
                  label={checkbox.label}
                />
              ))}
            </FormGroup>

            {form.errors.monday && (
              <FormHelperText>{Language.errorNoDayOfWeek}</FormHelperText>
            )}
          </FormControl>
        </FormFields>
      </FormSection>

      <FormSection
        title="自动停止"
        description={
          <>
            <div css={{ marginBottom: 16 }}>
            设置工作区启动后自动关闭前经过的小时数。在检测到工作区的最后活动后，将延长1小时。
            </div>
            {!allowTemplateAutoStop && (
              <Tooltip title="此选项可以在模板设置中启用">
                <DisabledBadge />
              </Tooltip>
            )}
          </>
        }
      >
        <FormFields>
          <FormControlLabel
            control={
              <Switch
                name="autostopEnabled"
                checked={form.values.autostopEnabled}
                onChange={handleToggleAutostop}
                disabled={!allowTemplateAutoStop}
              />
            }
            label={Language.stopSwitch}
          />
          <TextField
            {...formHelpers("ttl", {
              helperText: ttlShutdownAt(form.values.ttl),
              backendFieldName: "ttl_ms",
            })}
            // disabled if autostop disabled at template level or
            // if autostop feature is toggled off via the switch above
            disabled={
              isLoading ||
              !allowTemplateAutoStop ||
              !form.values.autostopEnabled
            }
            inputProps={{ min: 0, step: "any" }}
            label={Language.ttlLabel}
            type="number"
            fullWidth
          />
        </FormFields>
      </FormSection>
      <FormFooter
        onCancel={onCancel}
        isLoading={isLoading}
        // If both options, autostart and autostop, are disabled at the template
        // level, the form is disabled.
        submitDisabled={!allowTemplateAutoStart && !allowTemplateAutoStop}
      />
    </HorizontalForm>
  );
};

export const ttlShutdownAt = (formTTL: number): string => {
  if (formTTL === 0) {
    // Passing an empty value for TTL in the form results in a number that is not zero but less than 1.
    return "您的工作区不会自动关闭。";
  } else {
    return `您的工作区将在下次启动后 ${formatDuration(
      intervalToDuration({ start: 0, end: formTTL * 60 * 60 * 1000 }),
      { delimiter: " and " },
    )} 后关闭。我们在检测到活动时延迟关闭1小时。`;
  }
};
