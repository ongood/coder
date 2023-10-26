import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import MenuItem from "@mui/material/MenuItem";
import makeStyles from "@mui/styles/makeStyles";
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
import { ChangeEvent, FC } from "react";
import * as Yup from "yup";
import { getFormHelpers } from "utils/formUtils";
import { timeZones } from "utils/timeZones";
import { Pill } from "components/Pill/Pill";
import Tooltip from "@mui/material/Tooltip";

// REMARK: some plugins depend on utc, so it's listed first. Otherwise they're
//         sorted alphabetically.
dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);

export const Language = {
  errorNoDayOfWeek: "如果启用自动启动，请至少设置一个日期。",
  errorNoTime: "启动时间在启用自动启动时是必需的。",
  errorTime: "时间必须为HH:mm格式（24小时制）。",
  errorTimezone: "无效的时区。",
  errorNoStop: "在启用自动停止时，关闭时间必须大于零。",
  errorTtlMax: "请输入小于或等于168小时（7天）的限制。",
  daysOfWeekLabel: "星期",
  daySundayLabel: "周日",
  dayMondayLabel: "周一",
  dayTuesdayLabel: "周二",
  dayWednesdayLabel: "周三",
  dayThursdayLabel: "周四",
  dayFridayLabel: "周五",
  daySaturdayLabel: "周六",
  startTimeLabel: "启动时间",
  timezoneLabel: "时区",
  ttlLabel: "关闭时间倒计时（小时）",
  ttlCausesShutdownHelperText: "您的工作空间将在",
  ttlCausesShutdownAfterStart: "后自动关闭。每当我们检测到活动时，我们会延迟关闭时间",
  ttlCausesNoShutdownHelperText: "您的工作空间将不会自动关闭。",
  formTitle: "工作区日程",
  startSection: "启动",
  startSwitch: "启用自动启动",
  stopSection: "关闭",
  stopSwitch: "启用自动停止",
}

export interface WorkspaceScheduleFormProps {
  submitScheduleError?: unknown;
  initialValues: WorkspaceScheduleFormValues;
  isLoading: boolean;
  enableAutoStop: boolean;
  enableAutoStart: boolean;
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
    .integer()
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

export const WorkspaceScheduleForm: FC<
  React.PropsWithChildren<WorkspaceScheduleFormProps>
> = ({
  submitScheduleError,
  initialValues,
  isLoading,
  onCancel,
  onSubmit,
  initialTouched,
  defaultTTL,
  enableAutoStop,
  enableAutoStart,
}) => {
  const styles = useStyles();

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
      value: form.values.sunday,
      name: "sunday",
      label: Language.daySundayLabel,
    },
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
        title="Autostart"
        description={
          <>
            <div css={{ marginBottom: 16 }}>
              Select the time and days of week on which you want the workspace
              starting automatically.
            </div>
            {!enableAutoStart && (
              <Tooltip title="This option can be enabled in the template settings">
                <Pill text="Disabled" />
              </Tooltip>
            )}
          </>
        }
      >
        <FormFields>
          <FormControlLabel
            control={
              <Switch
                disabled={!enableAutoStart}
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
              disabled={isLoading || !form.values.autostartEnabled}
              label={Language.startTimeLabel}
              type="time"
              fullWidth
            />
            <TextField
              {...formHelpers("timezone")}
              disabled={isLoading || !form.values.autostartEnabled}
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
            <FormLabel className={styles.daysOfWeekLabel} component="legend">
              {Language.daysOfWeekLabel}
            </FormLabel>

            <FormGroup className={styles.daysOfWeekOptions}>
              {checkboxes.map((checkbox) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkbox.value}
                      disabled={isLoading || !form.values.autostartEnabled}
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
        title="Autostop"
        description={
          <>
            <div css={{ marginBottom: 16 }}>
              Set how many hours should elapse after you log off before the
              workspace automatically shuts down.
            </div>
            {!enableAutoStop && (
              <Tooltip title="This option can be enabled in the template settings">
                <Pill text="Disabled" />
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
                disabled={!enableAutoStop}
              />
            }
            label={Language.stopSwitch}
          />
          <TextField
            {...formHelpers("ttl", ttlShutdownAt(form.values.ttl), "ttl_ms")}
            disabled={isLoading || !form.values.autostopEnabled}
            inputProps={{ min: 0, step: 1 }}
            label={Language.ttlLabel}
            type="number"
            fullWidth
          />
        </FormFields>
      </FormSection>
      <FormFooter onCancel={onCancel} isLoading={isLoading} />
    </HorizontalForm>
  );
};

export const ttlShutdownAt = (formTTL: number): string => {
  if (formTTL < 1) {
    // Passing an empty value for TTL in the form results in a number that is not zero but less than 1.
    return Language.ttlCausesNoShutdownHelperText;
  } else {
    return `${Language.ttlCausesShutdownHelperText} ${dayjs
      .duration(formTTL, "hours")
      .humanize()} ${Language.ttlCausesShutdownAfterStart}.`;
  }
};

const useStyles = makeStyles((theme) => ({
  daysOfWeekLabel: {
    fontSize: 12,
  },
  daysOfWeekOptions: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: theme.spacing(0.5),
  },
}));
