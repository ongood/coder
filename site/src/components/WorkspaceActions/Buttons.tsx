import Button from "@mui/material/Button"
import BlockIcon from "@mui/icons-material/Block"
import CloudQueueIcon from "@mui/icons-material/CloudQueue"
import CropSquareIcon from "@mui/icons-material/CropSquare"
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline"
import ReplayIcon from "@mui/icons-material/Replay"
import { LoadingButton } from "components/LoadingButton/LoadingButton"
import { FC } from "react"
import BlockOutlined from "@mui/icons-material/BlockOutlined"

interface WorkspaceAction {
  loading?: boolean
  handleAction: () => void
}

export const UpdateButton: FC<WorkspaceAction> = ({
  handleAction,
  loading,
}) => {
  return (
    <LoadingButton
      loading={loading}
      loadingIndicator="Updating..."
      loadingPosition="start"
      size="small"
      data-testid="workspace-update-button"
      startIcon={<CloudQueueIcon />}
      onClick={handleAction}
    >
      Update
    </LoadingButton>
  )
}

export const StartButton: FC<WorkspaceAction> = ({ handleAction, loading }) => {
  return (
    <LoadingButton
      size="small"
      loading={loading}
      loadingIndicator="启动中..."
      loadingPosition="start"
      startIcon={<PlayCircleOutlineIcon />}
      onClick={handleAction}
    >
      启动
    </LoadingButton>
  )
}

export const StopButton: FC<WorkspaceAction> = ({ handleAction, loading }) => {
  return (
    <LoadingButton
      size="small"
      loading={loading}
      loadingIndicator="停止中..."
      loadingPosition="start"
      startIcon={<CropSquareIcon />}
      onClick={handleAction}
    >
      停止
    </LoadingButton>
  )
}

export const RestartButton: FC<WorkspaceAction> = ({
  handleAction,
  loading,
}) => {
  return (
    <LoadingButton
      loading={loading}
      loadingIndicator="重启中..."
      loadingPosition="start"
      size="small"
      startIcon={<ReplayIcon />}
      onClick={handleAction}
      data-testid="workspace-restart-button"
    >
      重启
    </LoadingButton>
  )
}

export const CancelButton: FC<WorkspaceAction> = ({ handleAction }) => {
  return (
    <Button size="small" startIcon={<BlockIcon />} onClick={handleAction}>
      取消
    </Button>
  )
}

interface DisabledProps {
  label: string
}

export const DisabledButton: FC<DisabledProps> = ({ label }) => {
  return (
    <Button size="small" startIcon={<BlockOutlined />} disabled>
      {label}
    </Button>
  )
}

interface LoadingProps {
  label: string
}

export const ActionLoadingButton: FC<LoadingProps> = ({ label }) => {
  return (
    <LoadingButton
      loading
      size="small"
      loadingPosition="start"
      loadingIndicator={label}
      // This icon can be anything
      startIcon={<ReplayIcon />}
    />
  )
}
