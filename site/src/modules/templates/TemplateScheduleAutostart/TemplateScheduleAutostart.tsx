import { type FC } from "react";
import { TemplateAutostartRequirementDaysValue } from "utils/schedule";
import Button from "@mui/material/Button";
import { Stack } from "components/Stack/Stack";
import FormHelperText from "@mui/material/FormHelperText";

export interface TemplateScheduleAutostartProps {
  allow_user_autostart?: boolean;
  autostart_requirement_days_of_week: TemplateAutostartRequirementDaysValue[];
  isSubmitting: boolean;
  onChange: (newDaysOfWeek: TemplateAutostartRequirementDaysValue[]) => void;
}

export const TemplateScheduleAutostart: FC<TemplateScheduleAutostartProps> = ({
  autostart_requirement_days_of_week,
  isSubmitting,
  allow_user_autostart,
  onChange,
}) => {
  return (
    <Stack
      direction="column"
      width="100%"
      alignItems="center"
      css={{ marginBottom: "20px" }}
    >
      <Stack
        direction="row"
        spacing={0}
        alignItems="baseline"
        justifyContent="center"
        css={{ width: "100%" }}
      >
        {(
          [
            { value: "monday", key: "Mon" },
            { value: "tuesday", key: "Tue" },
            { value: "wednesday", key: "Wed" },
            { value: "thursday", key: "Thu" },
            { value: "friday", key: "Fri" },
            { value: "saturday", key: "Sat" },
            { value: "sunday", key: "Sun" },
          ] as {
            value: TemplateAutostartRequirementDaysValue;
            key: string;
          }[]
        ).map((day) => (
          <Button
            key={day.key}
            css={{ borderRadius: 0 }}
            // TODO: Adding a background color would also help
            color={
              autostart_requirement_days_of_week.includes(day.value)
                ? "primary"
                : "secondary"
            }
            disabled={isSubmitting || !allow_user_autostart}
            onClick={() => {
              if (!autostart_requirement_days_of_week.includes(day.value)) {
                onChange(autostart_requirement_days_of_week.concat(day.value));
              } else {
                onChange(
                  autostart_requirement_days_of_week.filter(
                    (obj) => obj !== day.value,
                  ),
                );
              }
            }}
          >
            {day.key}
          </Button>
        ))}
      </Stack>
      <FormHelperText>
        <AutostartHelperText
          allowed={allow_user_autostart}
          days={autostart_requirement_days_of_week}
        />
      </FormHelperText>
    </Stack>
  );
};

export const sortedDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as TemplateAutostartRequirementDaysValue[];

interface AutostartHelperTextProps {
  allowed?: boolean;
  days: TemplateAutostartRequirementDaysValue[];
}

const AutostartHelperText: FC<AutostartHelperTextProps> = ({
  allowed,
  days: unsortedDays,
}) => {
  if (!allowed) {
    return <span>不允许工作区自动启动。</span>;
  }

  const days = new Set(unsortedDays);

  if (days.size === 7) {
    // If every day is allowed, no more explaining is needed.
    return <span>工作区可以在任何一天自动启动。</span>;
  }
  if (days.size === 0) {
    return (
      <span>
        工作区永远不会自动启动。这与禁用自动启动效果相同。
      </span>
    );
  }

  let daymsg = "工作区永远不会在周末自动启动。";
  if (days.size !== 5 || days.has("saturday") || days.has("sunday")) {
    daymsg = `工作区可以在${sortedDays
      .filter((day) => days.has(day))
      .join(", ")}自动启动。`;
  }

  return (
    <span>{daymsg}这些日期是相对于用户的时区而言的。</span>
  );
};
