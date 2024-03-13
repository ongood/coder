import type { FC } from "react";
import type { Template } from "api/typesGenerated";
import type { TemplateAutostopRequirementDaysValue } from "utils/schedule";

const autostopRequirementDescriptions = {
  off: "工作区不需要定期停止。",
  daily:
    "工作区需要每天在用户静默的时间和时区自动停止。",
  saturday:
    "工作区需要在用户的静默时间和时区中指定的每周六自动停止。",
  sunday:
    "工作区需要在用户的静默时间和时区中指定的每周日自动停止。",
};

export const convertAutostopRequirementDaysValue = (
  days: Template["autostop_requirement"]["days_of_week"],
): TemplateAutostopRequirementDaysValue => {
  if (days.length === 7) {
    return "daily";
  } else if (days.length === 1 && days[0] === "saturday") {
    return "saturday";
  } else if (days.length === 1 && days[0] === "sunday") {
    return "sunday";
  }

  // On unsupported values we default to "off".
  return "off";
};

interface AutostopRequirementDaysHelperTextProps {
  days: TemplateAutostopRequirementDaysValue;
}

export const AutostopRequirementDaysHelperText: FC<
  AutostopRequirementDaysHelperTextProps
> = ({ days = "off" }) => {
  return <span>{autostopRequirementDescriptions[days]}</span>;
};

interface AutostopRequirementWeeksHelperTextProps {
  days: TemplateAutostopRequirementDaysValue;
  weeks: number;
}

export const AutostopRequirementWeeksHelperText: FC<
  AutostopRequirementWeeksHelperTextProps
> = ({ days, weeks }) => {
  // Disabled
  if (days !== "saturday" && days !== "sunday") {
    return (
      <span>
        除非必须停止的日期是周六或周日，否则不能设置自动停止间隔周数。
      </span>
    );
  }

  if (weeks <= 1) {
    return (
      <span>
        工作区需要在用户的静默时间和时区中指定的每周特定日期自动停止。
      </span>
    );
  }

  return (
    <span>
      工作区需要在用户的静默时间和时区中指定的每{weeks}周的特定日期自动停止。
    </span>
  );
};
