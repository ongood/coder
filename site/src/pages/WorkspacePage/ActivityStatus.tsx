import { type FC } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Tooltip from "@mui/material/Tooltip";
import type { Workspace } from "api/typesGenerated";
import { useTime } from "hooks/useTime";
import type { WorkspaceActivityStatus } from "modules/workspaces/activity";
import { Pill } from "components/Pill/Pill";

dayjs.extend(relativeTime);

interface ActivityStatusProps {
  workspace: Workspace;
  status: WorkspaceActivityStatus;
}

export const ActivityStatus: FC<ActivityStatusProps> = ({
  workspace,
  status,
}) => {
  const usedAt = dayjs(workspace.last_used_at).tz(dayjs.tz.guess());

  // Don't bother updating if `status` will need to change before anything can happen.
  useTime(status === "ready" || status === "connected");

  switch (status) {
    case "ready":
      return <Pill type="active">就绪</Pill>;
    case "connected":
      return <Pill type="active">已连接</Pill>;
    case "inactive":
      return (
        <Tooltip
          title={
            <>
              此工作区最后活跃于{" "}
              {usedAt.format("MMMM D [at] h:mm A")}
            </>
          }
        >
          <Pill type="inactive">非活跃</Pill>
        </Tooltip>
      );
    case "notConnected":
      return (
        <Tooltip
          title={
            <>
              此工作区最后活跃于{" "}
              {usedAt.format("MMMM D [at] h:mm A")}
            </>
          }
        >
          <Pill type="inactive">未连接</Pill>
        </Tooltip>
      );
  }

  return null;
};
