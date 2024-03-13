import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import Tooltip from "@mui/material/Tooltip";
import type * as TypesGen from "api/typesGenerated";

export interface ShareIconProps {
  app: TypesGen.WorkspaceApp;
}

export const ShareIcon = ({ app }: ShareIconProps) => {
  if (app.external) {
    return (
      <Tooltip title="打开外部网址">
        <LaunchOutlinedIcon />
      </Tooltip>
    );
  }
  if (app.sharing_level === "authenticated") {
    return (
      <Tooltip title="与所有经过身份验证的用户共享">
        <GroupOutlinedIcon />
      </Tooltip>
    );
  }
  if (app.sharing_level === "public") {
    return (
      <Tooltip title="公开分享">
        <PublicOutlinedIcon />
      </Tooltip>
    );
  }

  return null;
};
