import CheckIcon from "@mui/icons-material/CheckOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import QueuedIcon from "@mui/icons-material/HourglassEmpty";
import type { FC, ReactNode } from "react";
import type { TemplateVersion } from "api/typesGenerated";
import { Pill, PillSpinner } from "components/Pill/Pill";
import type { ThemeRole } from "theme/roles";
import { getPendingStatusLabel } from "utils/provisionerJob";

interface TemplateVersionStatusBadgeProps {
  version: TemplateVersion;
}

export const TemplateVersionStatusBadge: FC<
  TemplateVersionStatusBadgeProps
> = ({ version }) => {
  const { text, icon, type } = getStatus(version);
  return (
    <Pill
      icon={icon}
      type={type}
      title={`Build status is ${text}`}
      role="status"
    >
      {text}
    </Pill>
  );
};

export const getStatus = (
  version: TemplateVersion,
): {
  type?: ThemeRole;
  text: string;
  icon: ReactNode;
} => {
  switch (version.job.status) {
    case "running":
      return {
        type: "info",
        text: "运行中",
        icon: <PillSpinner />,
      };
    case "pending":
      return {
        type: "info",
        text: getPendingStatusLabel(version.job),
        icon: <QueuedIcon />,
      };
    case "canceling":
      return {
        type: "warning",
        text: "取消中",
        icon: <PillSpinner />,
      };
    case "canceled":
      return {
        type: "warning",
        text: "已取消",
        icon: <ErrorIcon />,
      };
    case "unknown":
    case "failed":
      return {
        type: "error",
        text: "失败",
        icon: <ErrorIcon />,
      };
    case "succeeded":
      return {
        type: "success",
        text: "成功",
        icon: <CheckIcon />,
      };
  }
};
