import BlockIcon from "@mui/icons-material/Block";
import OutlinedBlockIcon from "@mui/icons-material/BlockOutlined";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import ReplayIcon from "@mui/icons-material/Replay";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import type { FC } from "react";
import type { Workspace, WorkspaceBuildParameter } from "api/typesGenerated";
import { TopbarButton } from "components/FullPageLayout/Topbar";
import { BuildParametersPopover } from "./BuildParametersPopover";

export interface ActionButtonProps {
  loading?: boolean;
  handleAction: (buildParameters?: WorkspaceBuildParameter[]) => void;
  disabled?: boolean;
  tooltipText?: string;
}

export const UpdateButton: FC<ActionButtonProps> = ({
  handleAction,
  loading,
}) => {
  return (
    <TopbarButton
      disabled={loading}
      data-testid="workspace-update-button"
      startIcon={<CloudQueueIcon />}
      onClick={() => handleAction()}
    >
      {loading ? <>升级中&hellip;</> : <>升级&hellip;</>}
    </TopbarButton>
  );
};

export const ActivateButton: FC<ActionButtonProps> = ({
  handleAction,
  loading,
}) => {
  return (
    <TopbarButton
      disabled={loading}
      startIcon={<PowerSettingsNewIcon />}
      onClick={() => handleAction()}
    >
      {loading ? <>激活中&hellip;</> : "激活"}
    </TopbarButton>
  );
};

interface ActionButtonPropsWithWorkspace extends ActionButtonProps {
  workspace: Workspace;
}

export const StartButton: FC<ActionButtonPropsWithWorkspace> = ({
  handleAction,
  workspace,
  loading,
  disabled,
  tooltipText,
}) => {
  const buttonContent = (
    <ButtonGroup
      variant="outlined"
      sx={{
        // Workaround to make the border transitions smoothly on button groups
        "& > button:hover + button": {
          borderLeft: "1px solid #FFF",
        },
      }}
      disabled={disabled}
    >
      <TopbarButton
        startIcon={<PlayCircleOutlineIcon />}
        onClick={() => handleAction()}
        disabled={disabled || loading}
      >
        {loading ? <>启动中&hellip;</> : "启动"}
      </TopbarButton>
      <BuildParametersPopover
        label="Start with build parameters"
        workspace={workspace}
        disabled={loading}
        onSubmit={handleAction}
      />
    </ButtonGroup>
  );

  return tooltipText ? (
    <Tooltip title={tooltipText}>{buttonContent}</Tooltip>
  ) : (
    buttonContent
  );
};

export const StopButton: FC<ActionButtonProps> = ({
  handleAction,
  loading,
}) => {
  return (
    <TopbarButton
      disabled={loading}
      startIcon={<CropSquareIcon />}
      onClick={() => handleAction()}
      data-testid="workspace-stop-button"
    >
      {loading ? <>停止中&hellip;</> : "停止"}
    </TopbarButton>
  );
};

export const RestartButton: FC<ActionButtonPropsWithWorkspace> = ({
  handleAction,
  loading,
  workspace,
}) => {
  return (
    <ButtonGroup
      variant="outlined"
      css={{
        // Workaround to make the border transitions smoothly on button groups
        "& > button:hover + button": {
          borderLeft: "1px solid #FFF",
        },
      }}
    >
      <TopbarButton
        startIcon={<ReplayIcon />}
        onClick={() => handleAction()}
        data-testid="workspace-restart-button"
        disabled={loading}
      >
        {loading ? <>重启中&hellip;</> : <>重启&hellip;</>}
      </TopbarButton>
      <BuildParametersPopover
        label="Restart with build parameters"
        workspace={workspace}
        disabled={loading}
        onSubmit={handleAction}
      />
    </ButtonGroup>
  );
};

export const UpdateAndStartButton: FC<ActionButtonProps> = ({
  handleAction,
}) => {
  return (
    <Tooltip title="This template requires automatic updates on workspace startup. Contact your administrator if you want to preserve the template version.">
      <TopbarButton
        startIcon={<PlayCircleOutlineIcon />}
        onClick={() => handleAction()}
      >
        Update and start&hellip;
      </TopbarButton>
    </Tooltip>
  );
};

export const CancelButton: FC<ActionButtonProps> = ({ handleAction }) => {
  return (
    <TopbarButton startIcon={<BlockIcon />} onClick={() => handleAction()}>
      取消
    </TopbarButton>
  );
};

interface DisabledButtonProps {
  label: string;
}

export const DisabledButton: FC<DisabledButtonProps> = ({ label }) => {
  return (
    <TopbarButton startIcon={<OutlinedBlockIcon />} disabled>
      {label}
    </TopbarButton>
  );
};

interface FavoriteButtonProps {
  onToggle: (workspaceID: string) => void;
  workspaceID: string;
  isFavorite: boolean;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
  onToggle: onToggle,
  workspaceID,
  isFavorite,
}) => {
  return (
    <TopbarButton
      startIcon={isFavorite ? <Star /> : <StarBorder />}
      onClick={() => onToggle(workspaceID)}
    >
      {isFavorite ? "取消收藏" : "收藏"}
    </TopbarButton>
  );
};
