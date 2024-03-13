import VariablesIcon from "@mui/icons-material/CodeOutlined";
import SecurityIcon from "@mui/icons-material/LockOutlined";
import GeneralIcon from "@mui/icons-material/SettingsOutlined";
import ScheduleIcon from "@mui/icons-material/TimerOutlined";
import type { FC } from "react";
import type { Template } from "api/typesGenerated";
import { ExternalAvatar } from "components/Avatar/Avatar";
import {
  Sidebar as BaseSidebar,
  SidebarHeader,
  SidebarNavItem,
} from "components/Sidebar/Sidebar";

interface SidebarProps {
  template: Template;
}

export const Sidebar: FC<SidebarProps> = ({ template }) => {
  return (
    <BaseSidebar>
      <SidebarHeader
        avatar={
          <ExternalAvatar src={template.icon} variant="square" fitImage />
        }
        title={template.display_name || template.name}
        linkTo={`/templates/${template.name}`}
        subtitle={template.name}
      />

      <SidebarNavItem href="" icon={GeneralIcon}>
        常规
      </SidebarNavItem>
      <SidebarNavItem href="permissions" icon={SecurityIcon}>
        权限
      </SidebarNavItem>
      <SidebarNavItem href="variables" icon={VariablesIcon}>
        变量
      </SidebarNavItem>
      <SidebarNavItem href="schedule" icon={ScheduleIcon}>
        日程
      </SidebarNavItem>
    </BaseSidebar>
  );
};
