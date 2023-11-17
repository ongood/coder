import { type TemplateVersion } from "api/typesGenerated";
import { type FC, type ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import CheckIcon from "@mui/icons-material/CheckOutlined";
import { Pill, type PillType } from "components/Pill/Pill";

export const TemplateVersionStatusBadge: FC<{
  version: TemplateVersion;
}> = ({ version }) => {
  const { text, icon, type } = getStatus(version);
  return (
    <Pill
      icon={icon}
      text={text}
      type={type}
      title={`构建状态为 ${text}`}
    />
  );
};

const LoadingIcon: FC = () => {
  return <CircularProgress size={10} style={{ color: "#FFF" }} />;
};

export const getStatus = (
  version: TemplateVersion,
): {
  type?: PillType;
  text: string;
  icon: ReactNode;
} => {
  switch (version.job.status) {
    case "running":
      return {
        type: "info",
        text: "运行中",
        icon: <LoadingIcon />,
      };
    case "pending":
      return {
        type: "info",
        text: "Pending",
        icon: <LoadingIcon />,
      };
    case "canceling":
      return {
        type: "warning",
        text: "取消中",
        icon: <LoadingIcon />,
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
