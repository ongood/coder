import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { type FC, useState } from "react";
import { Alert, type AlertProps } from "components/Alert/Alert";
import { docs } from "utils/docs";

export const ErrorScriptAlert: FC = () => {
  return (
    <TerminalAlert
      severity="warning"
      dismissible
      actions={<RefreshSessionButton />}
    >
      此工作区{" "}
      <Link
        title="启动脚本已退出并出现错误"
        href={docs("/templates#startup-script-exited-with-an-error")}
        target="_blank"
        rel="noreferrer"
      >
        启动脚本已退出并出现错误
      </Link>
      , 我们建议重新加载此会话并{" "}
      <Link
        title="调试启动脚本"
        href={docs("/templates#debugging-the-startup-script")}
        target="_blank"
        rel="noreferrer"
      >
        调试启动脚本。
      </Link>{" "}
      because{" "}
      <Link
        title="您的工作区可能不完整。"
        href={docs("/templates#your-workspace-may-be-incomplete")}
        target="_blank"
        rel="noreferrer"
      >
        您的工作区可能不完整。
      </Link>{" "}
    </TerminalAlert>
  );
};

export const LoadingScriptsAlert: FC = () => {
  return (
    <TerminalAlert
      dismissible
      severity="info"
      actions={<RefreshSessionButton />}
    >
      启动脚本仍在运行。 您可以继续使用该终端，但{" "}
      <Link
        title="您的工作空间可能不完整。"
        href={docs("/templates#your-workspace-may-be-incomplete")}
        target="_blank"
        rel="noreferrer"
      >
        {" "}
        您的工作空间可能不完整。
      </Link>
    </TerminalAlert>
  );
};

export const LoadedScriptsAlert: FC = () => {
  return (
    <TerminalAlert
      severity="success"
      dismissible
      actions={<RefreshSessionButton />}
    >
      启动脚本已成功完成。 工作区已准备就绪，但此{" "}
      <Link
        title="会话在启动脚本完成之前启动"
        href={docs("/templates#your-workspace-may-be-incomplete")}
        target="_blank"
        rel="noreferrer"
      >
        会话在启动脚本完成之前启动。
      </Link>{" "}
       为了确保您的 shell 环境是最新的，我们建议重新加载本次会话。
    </TerminalAlert>
  );
};

const TerminalAlert: FC<AlertProps> = (props) => {
  return (
    <Alert
      {...props}
      css={(theme) => ({
        borderRadius: 0,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.palette.divider,
        backgroundColor: theme.palette.background.paper,
        borderLeft: `3px solid ${theme.palette[props.severity!].light}`,
        marginBottom: 1,
      })}
    />
  );
};

export const DisconnectedAlert: FC<AlertProps> = (props) => {
  return (
    <TerminalAlert
      {...props}
      severity="warning"
      actions={<RefreshSessionButton />}
    >
      已断开连接
    </TerminalAlert>
  );
};

const RefreshSessionButton: FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <Button
      disabled={isRefreshing}
      size="small"
      variant="text"
      onClick={() => {
        setIsRefreshing(true);
        window.location.reload();
      }}
    >
      {isRefreshing ? "正在刷新会话..." : "刷新会话"}
    </Button>
  );
};
