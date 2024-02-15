import { type Interpolation, type Theme } from "@emotion/react";
import Link, { type LinkProps } from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/AddOutlined";
import RemoveIcon from "@mui/icons-material/RemoveOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Tooltip from "@mui/material/Tooltip";
import { visuallyHidden } from "@mui/utils";
import { type Dayjs } from "dayjs";
import { forwardRef, type FC, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Link as RouterLink } from "react-router-dom";
import { useTime } from "hooks/useTime";
import { isWorkspaceOn } from "utils/workspace";
import type { Template, Workspace } from "api/typesGenerated";
import {
  autostartDisplay,
  autostopDisplay,
  getDeadline,
  getMaxDeadline,
  getMaxDeadlineChange,
  getMinDeadline,
} from "utils/schedule";
import { getErrorMessage } from "api/errors";
import {
  updateDeadline,
  workspaceByOwnerAndNameKey,
} from "api/queries/workspaces";
import { TopbarData, TopbarIcon } from "components/FullPageLayout/Topbar";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import type { WorkspaceActivityStatus } from "modules/workspaces/activity";

export interface WorkspaceScheduleProps {
  status: WorkspaceActivityStatus;
  workspace: Workspace;
  template: Template;
  canUpdateWorkspace: boolean;
}

export const WorkspaceSchedule: FC<WorkspaceScheduleProps> = ({
  status,
  workspace,
  template,
  canUpdateWorkspace,
}) => {
  if (!shouldDisplayScheduleControls(workspace, status)) {
    return null;
  }

  return (
    <TopbarData>
      <TopbarIcon>
        <Tooltip title="日程">
          <ScheduleOutlined aria-label="Schedule" />
        </Tooltip>
      </TopbarIcon>
      <WorkspaceScheduleControls
        workspace={workspace}
        status={status}
        template={template}
        canUpdateSchedule={canUpdateWorkspace}
      />
    </TopbarData>
  );
};

export interface WorkspaceScheduleControlsProps {
  workspace: Workspace;
  status: WorkspaceActivityStatus;
  template: Template;
  canUpdateSchedule: boolean;
}

export const WorkspaceScheduleControls: FC<WorkspaceScheduleControlsProps> = ({
  workspace,
  status,
  template,
  canUpdateSchedule,
}) => {
  const queryClient = useQueryClient();
  const deadline = getDeadline(workspace);
  const maxDeadlineDecrease = getMaxDeadlineChange(deadline, getMinDeadline());
  const maxDeadlineIncrease = getMaxDeadlineChange(
    getMaxDeadline(workspace),
    deadline,
  );
  const deadlinePlusEnabled = maxDeadlineIncrease >= 1;
  const deadlineMinusEnabled = maxDeadlineDecrease >= 1;
  const deadlineUpdateTimeout = useRef<number>();
  const lastStableDeadline = useRef<Dayjs>(deadline);

  const updateWorkspaceDeadlineQueryData = (deadline: Dayjs) => {
    queryClient.setQueryData(
      workspaceByOwnerAndNameKey(workspace.owner_name, workspace.name),
      {
        ...workspace,
        latest_build: {
          ...workspace.latest_build,
          deadline: deadline.toISOString(),
        },
      },
    );
  };

  const updateDeadlineMutation = useMutation({
    ...updateDeadline(workspace),
    onSuccess: (_, updatedDeadline) => {
      displaySuccess("工作区关闭时间已成功更新。");
      lastStableDeadline.current = updatedDeadline;
    },
    onError: (error) => {
      displayError(
        getErrorMessage(
          error,
          "无法更新您的工作区关闭时间。请重试",
        ),
      );
      updateWorkspaceDeadlineQueryData(lastStableDeadline.current);
    },
  });

  const handleDeadlineChange = (newDeadline: Dayjs) => {
    clearTimeout(deadlineUpdateTimeout.current);
    // Optimistic update
    updateWorkspaceDeadlineQueryData(newDeadline);
    deadlineUpdateTimeout.current = window.setTimeout(() => {
      updateDeadlineMutation.mutate(newDeadline);
    }, 500);
  };

  return (
    <div css={styles.scheduleValue} data-testid="schedule-controls">
      {isWorkspaceOn(workspace) ? (
        <AutoStopDisplay
          workspace={workspace}
          status={status}
          template={template}
        />
      ) : (
        <ScheduleSettingsLink>
          开始于 {autostartDisplay(workspace.autostart_schedule)}
        </ScheduleSettingsLink>
      )}

      {canUpdateSchedule && canEditDeadline(workspace) && (
        <div css={styles.scheduleControls}>
          <Tooltip title="从截止时间减去1小时">
            <IconButton
              disabled={!deadlineMinusEnabled}
              size="small"
              css={styles.scheduleButton}
              onClick={() => {
                handleDeadlineChange(deadline.subtract(1, "h"));
              }}
            >
              <RemoveIcon />
              <span style={visuallyHidden}>减去1小时</span>
            </IconButton>
          </Tooltip>
          <Tooltip title="截止时间加1小时">
            <IconButton
              disabled={!deadlinePlusEnabled}
              size="small"
              css={styles.scheduleButton}
              onClick={() => {
                handleDeadlineChange(deadline.add(1, "h"));
              }}
            >
              <AddIcon />
              <span style={visuallyHidden}>增加1小时</span>
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

interface AutoStopDisplayProps {
  workspace: Workspace;
  status: WorkspaceActivityStatus;
  template: Template;
}

const AutoStopDisplay: FC<AutoStopDisplayProps> = ({
  workspace,
  status,
  template,
}) => {
  useTime();
  const { message, tooltip, danger } = autostopDisplay(
    workspace,
    status,
    template,
  );

  const display = (
    <ScheduleSettingsLink
      data-testid="schedule-controls-autostop"
      css={
        danger &&
        ((theme) => ({
          color: `${theme.roles.danger.fill.outline} !important`,
        }))
      }
    >
      {message}
    </ScheduleSettingsLink>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{display}</Tooltip>;
  }

  return display;
};

const ScheduleSettingsLink = forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    return (
      <Link
        ref={ref}
        component={RouterLink}
        to="settings/schedule"
        css={{
          color: "inherit",
          "&:first-letter": {
            textTransform: "uppercase",
          },
        }}
        {...props}
      />
    );
  },
);

const hasDeadline = (workspace: Workspace): boolean => {
  return Boolean(workspace.latest_build.deadline);
};

const hasAutoStart = (workspace: Workspace): boolean => {
  return Boolean(workspace.autostart_schedule);
};

export const canEditDeadline = (workspace: Workspace): boolean => {
  return isWorkspaceOn(workspace) && hasDeadline(workspace);
};

export const shouldDisplayScheduleControls = (
  workspace: Workspace,
  status: WorkspaceActivityStatus,
): boolean => {
  const willAutoStop = isWorkspaceOn(workspace) && hasDeadline(workspace);
  const willAutoStart = !isWorkspaceOn(workspace) && hasAutoStart(workspace);
  const hasActivity =
    status === "connected" && !workspace.latest_build.max_deadline;
  return (willAutoStop || willAutoStart) && !hasActivity;
};

const styles = {
  scheduleValue: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontVariantNumeric: "tabular-nums",
  },

  scheduleControls: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  scheduleButton: (theme) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    width: 20,
    height: 20,

    "& svg.MuiSvgIcon-root": {
      width: 12,
      height: 12,
    },
  }),
} satisfies Record<string, Interpolation<Theme>>;
