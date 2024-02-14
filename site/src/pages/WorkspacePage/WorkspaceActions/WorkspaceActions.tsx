import { type FC, type ReactNode, Fragment } from "react";
import { Workspace, WorkspaceBuildParameter } from "api/typesGenerated";
import { useWorkspaceDuplication } from "pages/CreateWorkspacePage/useWorkspaceDuplication";
import { mustUpdateWorkspace } from "utils/workspace";
import { type ActionType, abilitiesByWorkspaceStatus } from "./constants";
import {
  CancelButton,
  DisabledButton,
  StartButton,
  StopButton,
  RestartButton,
  UpdateButton,
  ActivateButton,
  RetryButton,
  FavoriteButton,
} from "./Buttons";

import Divider from "@mui/material/Divider";
import DuplicateIcon from "@mui/icons-material/FileCopyOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {
  MoreMenu,
  MoreMenuContent,
  MoreMenuItem,
  MoreMenuTrigger,
} from "components/MoreMenu/MoreMenu";
import { TopbarIconButton } from "components/FullPageLayout/Topbar";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";

export interface WorkspaceActionsProps {
  workspace: Workspace;
  handleToggleFavorite: () => void;
  handleStart: (buildParameters?: WorkspaceBuildParameter[]) => void;
  handleStop: () => void;
  handleRestart: (buildParameters?: WorkspaceBuildParameter[]) => void;
  handleDelete: () => void;
  handleUpdate: () => void;
  handleCancel: () => void;
  handleSettings: () => void;
  handleChangeVersion: () => void;
  handleRetry: () => void;
  handleRetryDebug: () => void;
  handleDormantActivate: () => void;
  isUpdating: boolean;
  isRestarting: boolean;
  children?: ReactNode;
  canChangeVersions: boolean;
  canRetryDebug: boolean;
  isOwner: boolean;
}

export const WorkspaceActions: FC<WorkspaceActionsProps> = ({
  workspace,
  handleToggleFavorite,
  handleStart,
  handleStop,
  handleRestart,
  handleDelete,
  handleUpdate,
  handleCancel,
  handleSettings,
  handleRetry,
  handleRetryDebug,
  handleChangeVersion,
  handleDormantActivate,
  isUpdating,
  isRestarting,
  canChangeVersions,
  canRetryDebug,
  isOwner,
}) => {
  const { duplicateWorkspace, isDuplicationReady } =
    useWorkspaceDuplication(workspace);

  const { actions, canCancel, canAcceptJobs } = abilitiesByWorkspaceStatus(
    workspace,
    canRetryDebug,
  );
  const showCancel =
    canCancel &&
    (workspace.template_allow_user_cancel_workspace_jobs || isOwner);

  const mustUpdate = mustUpdateWorkspace(workspace, canChangeVersions);
  const tooltipText = getTooltipText(workspace, mustUpdate, canChangeVersions);
  const canBeUpdated = workspace.outdated && canAcceptJobs;

  // A mapping of button type to the corresponding React component
  const buttonMapping: Record<ActionType, ReactNode> = {
    update: <UpdateButton handleAction={handleUpdate} />,
    updating: <UpdateButton loading handleAction={handleUpdate} />,
    start: (
      <StartButton
        workspace={workspace}
        handleAction={handleStart}
        disabled={mustUpdate}
        tooltipText={tooltipText}
      />
    ),
    starting: (
      <StartButton
        loading
        workspace={workspace}
        handleAction={handleStart}
        disabled={mustUpdate}
        tooltipText={tooltipText}
      />
    ),
    stop: <StopButton handleAction={handleStop} />,
    stopping: <StopButton loading handleAction={handleStop} />,
    restart: (
      <RestartButton
        workspace={workspace}
        handleAction={handleRestart}
        disabled={mustUpdate}
        tooltipText={tooltipText}
      />
    ),
    restarting: (
      <RestartButton
        loading
        workspace={workspace}
        handleAction={handleRestart}
        disabled={mustUpdate}
        tooltipText={tooltipText}
      />
    ),
    deleting: <DisabledButton label="删除中" />,
    canceling: <DisabledButton label="取消中..." />,
    deleted: <DisabledButton label="已删除" />,
    pending: <DisabledButton label="等待中..." />,
    activate: <ActivateButton handleAction={handleDormantActivate} />,
    activating: <ActivateButton loading handleAction={handleDormantActivate} />,
    retry: <RetryButton handleAction={handleRetry} />,
    retryDebug: <RetryButton debug handleAction={handleRetryDebug} />,
    toggleFavorite: (
      <FavoriteButton
        workspaceID={workspace.id}
        isFavorite={workspace.favorite}
        onToggle={handleToggleFavorite}
      />
    ),
  };

  return (
    <div
      css={{ display: "flex", alignItems: "center", gap: 8 }}
      data-testid="workspace-actions"
    >
      {canBeUpdated && (
        <>{isUpdating ? buttonMapping.updating : buttonMapping.update}</>
      )}

      {isRestarting
        ? buttonMapping.restarting
        : actions.map((action) => (
            <Fragment key={action}>{buttonMapping[action]}</Fragment>
          ))}

      {showCancel && <CancelButton handleAction={handleCancel} />}

      {buttonMapping.toggleFavorite}

      <MoreMenu>
        <MoreMenuTrigger>
          <TopbarIconButton
            title="More options"
            data-testid="workspace-options-button"
            aria-controls="workspace-options"
            disabled={!canAcceptJobs}
          >
            <MoreVertOutlined />
          </TopbarIconButton>
        </MoreMenuTrigger>

        <MoreMenuContent id="workspace-options">
          <MoreMenuItem onClick={handleSettings}>
            <SettingsIcon />
            设置
          </MoreMenuItem>

          {canChangeVersions && (
            <MoreMenuItem onClick={handleChangeVersion}>
              <HistoryIcon />
              更改版本&hellip;
            </MoreMenuItem>
          )}

          <MoreMenuItem
            onClick={duplicateWorkspace}
            disabled={!isDuplicationReady}
          >
            <DuplicateIcon />
            复制&hellip;
          </MoreMenuItem>

          <Divider />

          <MoreMenuItem
            danger
            onClick={handleDelete}
            data-testid="delete-button"
          >
            <DeleteIcon />
            删除&hellip;
          </MoreMenuItem>
        </MoreMenuContent>
      </MoreMenu>
    </div>
  );
};

function getTooltipText(
  workspace: Workspace,
  mustUpdate: boolean,
  canChangeVersions: boolean,
): string {
  if (!mustUpdate && !canChangeVersions) {
    return "";
  }

  if (!mustUpdate && canChangeVersions) {
    return "此模板要求在工作区启动时自动更新，但模板管理员可以忽略此策略。";
  }

  if (workspace.template_require_active_version) {
    return "此模板要求在工作区启动时自动更新。如果要保留模板版本，请联系您的管理员。";
  }

  if (workspace.automatic_updates === "always") {
    return "此工作区已启用自动更新。如果要保留模板版本，请在工作区设置中修改更新策略。";
  }

  return "";
}
