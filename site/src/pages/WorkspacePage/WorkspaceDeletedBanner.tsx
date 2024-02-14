import Button from "@mui/material/Button";
import { type FC } from "react";
import { Alert } from "components/Alert/Alert";

export interface WorkspaceDeletedBannerProps {
  handleClick: () => void;
}

export const WorkspaceDeletedBanner: FC<WorkspaceDeletedBannerProps> = ({
  handleClick,
}) => {
  const NewWorkspaceButton = (
    <Button onClick={handleClick} size="small" variant="text">
      创建新工作区
    </Button>
  );

  return (
    <Alert severity="warning" actions={NewWorkspaceButton}>
      这个工作区已被删除，无法编辑。
    </Alert>
  );
};
