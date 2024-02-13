import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import { FormikContextType, useFormik } from "formik";
import { type FC, useEffect, useState } from "react";
import * as Yup from "yup";
import { getFormHelpers } from "utils/formUtils";
import type {
  UpdateUserQuietHoursScheduleRequest,
  UserQuietHoursScheduleResponse,
} from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { Form, FormFields } from "components/Form/Form";
import { Stack } from "components/Stack/Stack";
import { Alert } from "components/Alert/Alert";
import { timeToCron, quietHoursDisplay, validTime } from "utils/schedule";
import { timeZones, getPreferredTimezone } from "utils/timeZones";

export interface ScheduleFormValues {
  time: string;
  timezone: string;
}

const validationSchema = Yup.object({
  time: Yup.string()
    .ensure()
    .test("is-time-string", "Time must be in HH:mm format.", (value) => {
      if (!validTime(value)) {
        return false;
      }
      const parts = value.split(":");
      const HH = Number(parts[0]);
      const mm = Number(parts[1]);
      return HH >= 0 && HH <= 23 && mm >= 0 && mm <= 59;
    }),
  timezone: Yup.string().required(),
});

export interface ScheduleFormProps {
  isLoading: boolean;
  initialValues: UserQuietHoursScheduleResponse;
  submitError: unknown;
  onSubmit: (data: UpdateUserQuietHoursScheduleRequest) => void;
  // now can be set to force the time used for "Next occurrence" in tests.
  now?: Date;
}

export const ScheduleForm: FC<ScheduleFormProps> = ({
  isLoading,
  initialValues,
  submitError,
  onSubmit,
  now,
}) => {
  // Update every 15 seconds to update the "Next occurrence" field.
  const [, setTime] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 15000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // If the user has a custom schedule, use that as the initial values.
  // Otherwise, use the default time, with their local timezone.
  const formInitialValues = { ...initialValues };
  if (!initialValues.user_set) {
    formInitialValues.timezone = getPreferredTimezone();
  }

  const form: FormikContextType<ScheduleFormValues> =
    useFormik<ScheduleFormValues>({
      initialValues: formInitialValues,
      validationSchema,
      onSubmit: (values) => {
        onSubmit({
          schedule: timeToCron(values.time, values.timezone),
        });
      },
    });
  const getFieldHelpers = getFormHelpers<ScheduleFormValues>(form, submitError);

  return (
    <Form onSubmit={form.handleSubmit}>
      <FormFields>
        {Boolean(submitError) && <ErrorAlert error={submitError} />}

        {!initialValues.user_set && (
          <Alert severity="info">
            您当前正在使用默认的静默时间日程，每天在 <code>{initialValues.time}</code> 开始，时区为 <code>{initialValues.timezone}</code>。
          </Alert>
        )}

        {!initialValues.user_can_set && (
          <Alert severity="error">
            您的管理员已禁用设置自定义静默时间日程的权限。
          </Alert>
        )}

        <Stack direction="row">
          <TextField
            {...getFieldHelpers("time")}
            disabled={isLoading || !initialValues.user_can_set}
            label="开始时间"
            type="time"
            fullWidth
          />
          <TextField
            {...getFieldHelpers("timezone")}
            disabled={isLoading || !initialValues.user_can_set}
            label="时区"
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

        <TextField
          disabled
          fullWidth
          label="下一次出现"
          value={quietHoursDisplay(form.values.time, form.values.timezone, now)}
        />

        <div>
          <LoadingButton
            loading={isLoading}
            disabled={isLoading || !initialValues.user_can_set}
            type="submit"
            variant="contained"
          >
            更新日程
          </LoadingButton>
        </div>
      </FormFields>
    </Form>
  );
};
