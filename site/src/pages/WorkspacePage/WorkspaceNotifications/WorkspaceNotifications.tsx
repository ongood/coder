import type { Interpolation, Theme } from "@emotion/react";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningRounded from "@mui/icons-material/WarningRounded";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import dayjs from "dayjs";
import { type FC, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { workspaceResolveAutostart } from "api/queries/workspaceQuota";
import type { Template, TemplateVersion, Workspace } from "api/typesGenerated";
import { MemoizedInlineMarkdown } from "components/Markdown/Markdown";
import { useDashboard } from "modules/dashboard/useDashboard";
import { TemplateUpdateMessage } from "modules/templates/TemplateUpdateMessage";
import type { WorkspacePermissions } from "../permissions";
import {
  NotificationActionButton,
  type NotificationItem,
  Notifications,
} from "./Notifications";

type WorkspaceNotificationsProps = {
  workspace: Workspace;
  template: Template;
  permissions: WorkspacePermissions;
  onRestartWorkspace: () => void;
  onUpdateWorkspace: () => void;
  onActivateWorkspace: () => void;
  latestVersion?: TemplateVersion;
};

export const WorkspaceNotifications: FC<WorkspaceNotificationsProps> = ({
  workspace,
  template,
  latestVersion,
  permissions,
  onRestartWorkspace,
  onUpdateWorkspace,
  onActivateWorkspace,
}) => {
  const notifications: NotificationItem[] = [];

  // Outdated
  const canAutostartQuery = useQuery(workspaceResolveAutostart(workspace.id));
  const isParameterMismatch =
    canAutostartQuery.data?.parameter_mismatch ?? false;
  const canAutostart = !isParameterMismatch;
  const updateRequired =
    (workspace.template_require_active_version ||
      workspace.automatic_updates === "always") &&
    workspace.outdated;
  const autoStartFailing = workspace.autostart_schedule && !canAutostart;
  const requiresManualUpdate = updateRequired && autoStartFailing;

  if (workspace.outdated && latestVersion) {
    const actions = (
      <NotificationActionButton onClick={onUpdateWorkspace}>
        升级
      </NotificationActionButton>
    );
    if (requiresManualUpdate) {
      notifications.push({
        title: "您的工作区已禁用自动启动。",
        severity: "warning",
        detail:
          "自动启动无法自动更新您的工作区。请手动更新您的工作区以重新启用自动启动。",

        actions,
      });
    } else {
      notifications.push({
        title: "你的工作区有可用更新",
        severity: "info",
        detail: (
          <TemplateUpdateMessage>{latestVersion.message}</TemplateUpdateMessage>
        ),
        actions,
      });
    }
  }

  // Unhealthy
  if (
    workspace.latest_build.status === "running" &&
    !workspace.health.healthy
  ) {
    notifications.push({
      title: "工作区不健康",
      severity: "warning",
      detail: (
        <>
          您的工作区已运行，但是{" "}
          {workspace.health.failing_agents.length > 1
            ? `${workspace.health.failing_agents.length}个代理不健康`
            : `1个代理不健康`}
          .
        </>
      ),
      actions: permissions.updateWorkspace ? (
        <NotificationActionButton onClick={onRestartWorkspace}>
          重启
        </NotificationActionButton>
      ) : undefined,
    });
  }

  // Dormant
  const { entitlements } = useDashboard();
  const advancedSchedulingEnabled =
    entitlements.features["advanced_template_scheduling"].enabled;
  if (advancedSchedulingEnabled && workspace.dormant_at) {
    const formatDate = (dateStr: string, timestamp: boolean): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        ...(timestamp ? { hour: "numeric", minute: "numeric" } : {}),
      });
    };
    const actions = (
      <NotificationActionButton onClick={onActivateWorkspace}>
        激活
      </NotificationActionButton>
    );
    notifications.push({
      actions,
      title: "工作区处于休眠状态",
      severity: "warning",
      detail: workspace.deleting_at ? (
        <>
          这个工作区已经有{" "}
          {formatDistanceToNow(Date.parse(workspace.last_used_at))} 没有被使用，并且于 {formatDate(workspace.dormant_at, false)} 标记为休眠。它被安排在 {formatDate(workspace.deleting_at, true)} 被删除。要保留它，您必须激活该工作区。
        </>
      ) : (
        <>
          这个工作区已经有{" "}
          {formatDistanceToNow(Date.parse(workspace.last_used_at))} 没有被使用，并且于 {formatDate(workspace.dormant_at, false)} 标记为休眠。它没有被安排自动删除，但如果在此模板上启用了自动删除，它将成为候选对象。要保留它，您必须激活该工作区。
        </>
      ),
    });
  }

  // Pending in Queue
  const [showAlertPendingInQueue, setShowAlertPendingInQueue] = useState(false);
  // 2023-11-15 - MES - This effect will be called every single render because
  // "now" will always change and invalidate the dependency array. Need to
  // figure out if this effect really should run every render (possibly meaning
  // no dependency array at all), or how to get the array stabilized (ideal)
  const now = dayjs();
  useEffect(() => {
    if (
      workspace.latest_build.status !== "pending" ||
      workspace.latest_build.job.queue_size === 0
    ) {
      if (!showAlertPendingInQueue) {
        return;
      }

      const hideTimer = setTimeout(() => {
        setShowAlertPendingInQueue(false);
      }, 250);
      return () => {
        clearTimeout(hideTimer);
      };
    }

    const t = Math.max(
      0,
      5000 - dayjs().diff(dayjs(workspace.latest_build.created_at)),
    );
    const showTimer = setTimeout(() => {
      setShowAlertPendingInQueue(true);
    }, t);

    return () => {
      clearTimeout(showTimer);
    };
  }, [workspace, now, showAlertPendingInQueue]);

  if (showAlertPendingInQueue) {
    notifications.push({
      title: "Workspace build is pending",
      severity: "info",
      detail: (
        <>
          此工作区构建作业正在等待一个配置器可用。如果您已经等待了较长时间，请联系管理员寻求帮助。
          <span css={{ display: "block", marginTop: 12 }}>
            队列中的位置:{" "}
            <strong>{workspace.latest_build.job.queue_position}</strong>
          </span>
        </>
      ),
    });
  }

  // Deprecated
  if (template.deprecated) {
    notifications.push({
      title: "This workspace uses a deprecated template",
      severity: "warning",
      detail: (
        <MemoizedInlineMarkdown>
          {template.deprecation_message}
        </MemoizedInlineMarkdown>
      ),
    });
  }

  const infoNotifications = notifications.filter((n) => n.severity === "info");
  const warningNotifications = notifications.filter(
    (n) => n.severity === "warning",
  );

  return (
    <div css={styles.notificationsGroup}>
      {infoNotifications.length > 0 && (
        <Notifications
          items={infoNotifications}
          severity="info"
          icon={<InfoOutlined />}
        />
      )}

      {warningNotifications.length > 0 && (
        <Notifications
          items={warningNotifications}
          severity="warning"
          icon={<WarningRounded />}
        />
      )}
    </div>
  );
};

const styles = {
  notificationsGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
} satisfies Record<string, Interpolation<Theme>>;
