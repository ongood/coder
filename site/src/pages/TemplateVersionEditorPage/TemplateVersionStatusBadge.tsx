import { type FC, type ReactNode } from "react";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import CheckIcon from "@mui/icons-material/CheckOutlined";
import type { TemplateVersion } from "api/typesGenerated";
import { type ThemeRole } from "theme/roles";
import { Pill, PillSpinner } from "components/Pill/Pill";

interface TemplateVersionStatusBadgeProps {
  version: TemplateVersion;
}

export const TemplateVersionStatusBadge: FC<
  TemplateVersionStatusBadgeProps
> = ({ version }) => {
  const { text, icon, type } = getStatus(version);
  return (
    <Pill icon={icon} type={type} title={`Build status is ${text}`}>
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
        text: "Running",
        icon: <PillSpinner />,
      };
    case "pending":
      return {
        type: "info",
        text: "Pending",
        icon: <PillSpinner />,
      };
    case "canceling":
      return {
        type: "warning",
        text: "Canceling",
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
