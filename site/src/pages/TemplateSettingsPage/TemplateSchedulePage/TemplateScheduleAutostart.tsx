import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import type { FC } from "react";
import { Stack } from "components/Stack/Stack";
import {
  sortedDays,
  type TemplateAutostartRequirementDaysValue,
} from "utils/schedule";

export interface TemplateScheduleAutostartProps {
  enabled: boolean;
  value: TemplateAutostartRequirementDaysValue[];
  isSubmitting: boolean;
  onChange: (value: TemplateAutostartRequirementDaysValue[]) => void;
}

export const TemplateScheduleAutostart: FC<TemplateScheduleAutostartProps> = ({
  value,
  isSubmitting,
  enabled,
  onChange,
}) => {
  return (
    <Stack width="100%" alignItems="start" spacing={1}>
      <Stack
        direction="row"
        spacing={0}
        alignItems="baseline"
        justifyContent="center"
        css={{ width: "100%" }}
      >
        {(
          [
            { value: "monday", key: "周一" },
            { value: "tuesday", key: "周二" },
            { value: "wednesday", key: "周三" },
            { value: "thursday", key: "周四" },
            { value: "friday", key: "周五" },
            { value: "saturday", key: "周六" },
            { value: "sunday", key: "周日" },
          ] as {
            value: TemplateAutostartRequirementDaysValue;
            key: string;
          }[]
        ).map((day) => (
          <Button
            fullWidth
            key={day.key}
            css={{ borderRadius: 0 }}
            // TODO: Adding a background color would also help
            color={value.includes(day.value) ? "primary" : "secondary"}
            disabled={isSubmitting || !enabled}
            onClick={() => {
              if (!value.includes(day.value)) {
                onChange(value.concat(day.value));
              } else {
                onChange(value.filter((obj) => obj !== day.value));
              }
            }}
          >
            {day.key}
          </Button>
        ))}
      </Stack>
      <FormHelperText>
        <AutostartHelperText allowed={enabled} days={value} />
      </FormHelperText>
    </Stack>
  );
};

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
