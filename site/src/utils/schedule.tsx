import Link from "@mui/material/Link";
import cronstrue from "cronstrue";
import cronParser from "cron-parser";
import dayjs, { type Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { Template, Workspace } from "api/typesGenerated";
import { HelpTooltipTitle } from "components/HelpTooltip/HelpTooltip";
import type { WorkspaceActivityStatus } from "modules/workspaces/activity";
import { isWorkspaceOn } from "./workspace";

// REMARK: some plugins depend on utc, so it's listed first. Otherwise they're
//         sorted alphabetically.
dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
/**
 * @fileoverview Client-side counterpart of the coderd/autostart/schedule Go
 * package. This package is a variation on crontab that uses minute, hour and
 * day of week.
 */

/**
 * DEFAULT_TIMEZONE is the default timezone that crontab assumes unless one is
 * specified.
 */
const DEFAULT_TIMEZONE = "UTC";

/**
 * stripTimezone strips a leading timezone from a schedule string
 */
export const stripTimezone = (raw: string): string => {
  return raw.replace(/CRON_TZ=\S*\s/, "");
};

/**
 * extractTimezone returns a leading timezone from a schedule string if one is
 * specified; otherwise the specified defaultTZ
 */
export const extractTimezone = (
  raw: string,
  defaultTZ = DEFAULT_TIMEZONE,
): string => {
  const matches = raw.match(/CRON_TZ=\S*\s/g);

  if (matches && matches.length > 0) {
    return matches[0].replace(/CRON_TZ=/, "").trim();
  } else {
    return defaultTZ;
  }
};

/** Language used in the schedule components */
export const Language = {
  manual: "手动",
  workspaceShuttingDownLabel: "工作区正在关闭",
  afterStart: "启动后",
  autostartLabel: "开始时间",
  autostopLabel: "停止时间",
}

export const autostartDisplay = (schedule: string | undefined): string => {
  if (schedule) {
    return (
      cronstrue
        .toString(stripTimezone(schedule), {
          throwExceptionOnParseError: false,
        })
        // We don't want to keep the At because it is on the label
        .replace("At", "")
    );
  } else {
    return Language.manual;
  }
};

export const isShuttingDown = (
  workspace: Workspace,
  deadline?: Dayjs,
): boolean => {
  if (!deadline) {
    if (!workspace.latest_build.deadline) {
      return false;
    }
    deadline = dayjs(workspace.latest_build.deadline).utc();
  }
  const now = dayjs().utc();
  return isWorkspaceOn(workspace) && now.isAfter(deadline);
};

export const autostopDisplay = (
  workspace: Workspace,
  activityStatus: WorkspaceActivityStatus,
  template: Template,
): {
  message: ReactNode;
  tooltip?: ReactNode;
  danger?: boolean;
} => {
  const ttl = workspace.ttl_ms;

  if (isWorkspaceOn(workspace) && workspace.latest_build.deadline) {
    // Workspace is on --> derive from latest_build.deadline. Note that the
    // user may modify their workspace object (ttl) while the workspace is
    // running and depending on system semantics, the deadline may still
    // represent the previously defined ttl. Thus, we always derive from the
    // deadline as the source of truth.

    const deadline = dayjs(workspace.latest_build.deadline).tz(
      dayjs.tz.guess(),
    );
    const now = dayjs(workspace.latest_build.deadline);
    if (isShuttingDown(workspace, deadline)) {
      return {
        message: Language.workspaceShuttingDownLabel,
      };
    } else if (
      activityStatus === "connected" &&
      deadline.isBefore(now.add(2, "hour"))
    ) {
      return {
        message: `即将要求停止`,
        tooltip: (
          <>
            <HelpTooltipTitle>即将到期的停止</HelpTooltipTitle>
            该工作区将在{" "}
            {dayjs(workspace.latest_build.max_deadline).format(
              "MMMM D [at] h:mm A",
            )}
            停止。您可以在此之前重新启动您的工作区，以避免中断。
          </>
        ),
        danger: true,
      };
    } else {
      let title = (
        <HelpTooltipTitle>模板自动停止规定</HelpTooltipTitle>
      );
      let reason: ReactNode = ` 因为 ${template.display_name} 模板具有自动停止规定。`;
      if (template.autostop_requirement && template.allow_user_autostop) {
        title = <HelpTooltipTitle>自动停止计划</HelpTooltipTitle>;
        reason = (
          <>
            {" "}
            因为此工作区已启用自动停止。您可以从此工作区的{" "}
            <Link component={RouterLink} to="settings/schedule">
            日程安排设置
            </Link>
            中禁用自动停止。
          </>
        );
      }
      return {
        message: `Stop ${deadline.fromNow()}`,
        tooltip: (
          <>
            {title}
            这个工作区将在{" "}
            {deadline.format("MMMM D [at] h:mm A")}
            停止{reason}
          </>
        ),
        danger: isShutdownSoon(workspace),
      };
    }
  } else if (!ttl || ttl < 1) {
    // If the workspace is not on, and the ttl is 0 or undefined, then the
    // workspace is set to manually shutdown.
    return {
      message: Language.manual,
    };
  } else {
    // The workspace has a ttl set, but is either in an unknown state or is
    // not running. Therefore, we derive from workspace.ttl.
    const duration = dayjs.duration(ttl, "milliseconds");
    return {
      message: `Stop ${duration.humanize()} ${Language.afterStart}`,
    };
  }
};

const isShutdownSoon = (workspace: Workspace): boolean => {
  const deadline = workspace.latest_build.deadline;
  if (!deadline) {
    return false;
  }
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();
  const oneHour = 1000 * 60 * 60;
  return diff < oneHour;
};

export const deadlineExtensionMin = dayjs.duration(30, "minutes");
export const deadlineExtensionMax = dayjs.duration(24, "hours");

/**
 * Depends on the time the workspace was last updated and a global constant.
 * @param ws workspace
 * @returns the latest datetime at which the workspace can be automatically shut down.
 */
export function getMaxDeadline(ws: Workspace | undefined): dayjs.Dayjs {
  // note: we count runtime from updated_at as started_at counts from the start of
  // the workspace build process, which can take a while.
  if (ws === undefined) {
    throw Error("无法计算最大截止日期，因为工作空间未定义");
  }
  const startedAt = dayjs(ws.latest_build.updated_at);
  return startedAt.add(deadlineExtensionMax);
}

/**
 * Depends on the current time and a global constant.
 * @returns the earliest datetime at which the workspace can be automatically shut down.
 */
export function getMinDeadline(): dayjs.Dayjs {
  return dayjs().add(deadlineExtensionMin);
}

export const getDeadline = (workspace: Workspace): dayjs.Dayjs =>
  dayjs(workspace.latest_build.deadline).utc();

/**
 * Get number of hours you can add or subtract to the current deadline before hitting the max or min deadline.
 * @param deadline
 * @param workspace
 * @returns number, in hours
 */
export const getMaxDeadlineChange = (
  deadline: dayjs.Dayjs,
  extremeDeadline: dayjs.Dayjs,
): number => Math.abs(deadline.diff(extremeDeadline, "hours"));

export const validTime = (time: string): boolean => {
  return /^[0-9][0-9]:[0-9][0-9]$/.test(time);
};

export const timeToCron = (time: string, tz?: string) => {
  if (!validTime(time)) {
    throw new Error(`Invalid time: ${time}`);
  }
  const [HH, mm] = time.split(":");
  let prefix = "";
  if (tz) {
    prefix = `CRON_TZ=${tz} `;
  }
  return `${prefix}${Number(mm)} ${Number(HH)} * * *`;
};

export const quietHoursDisplay = (
  time: string,
  tz: string,
  now: Date | undefined,
): string => {
  if (!validTime(time)) {
    return "Invalid time";
  }

  // The cron-parser package doesn't accept a timezone in the cron string, but
  // accepts it as an option.
  const cron = timeToCron(time);
  const parsed = cronParser.parseExpression(cron, {
    currentDate: now,
    iterator: false,
    utc: false,
    tz,
  });

  const today = dayjs(now).tz(tz);
  const day = dayjs(parsed.next().toDate()).tz(tz);
  let display = day.format("h:mmA");

  if (day.isSame(today, "day")) {
    display += " today";
  } else if (day.isSame(today.add(1, "day"), "day")) {
    display += " tomorrow";
  } else {
    // This case will rarely ever be hit, as we're dealing with only times and
    // not dates, but it can be hit due to mismatched browser timezone to cron
    // timezone or due to daylight savings changes.
    display += ` on ${day.format("dddd, MMMM D")}`;
  }

  display += ` (${day.from(today)}) in ${tz}`;

  return display;
};

export type TemplateAutostartRequirementDaysValue =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TemplateAutostopRequirementDaysValue =
  | "off"
  | "daily"
  | "saturday"
  | "sunday";

export const calculateAutostopRequirementDaysValue = (
  value: TemplateAutostopRequirementDaysValue,
): Template["autostop_requirement"]["days_of_week"] => {
  switch (value) {
    case "daily":
      return [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
    case "saturday":
      return ["saturday"];
    case "sunday":
      return ["sunday"];
  }

  return [];
};