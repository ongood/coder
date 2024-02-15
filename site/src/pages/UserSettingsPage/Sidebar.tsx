import { type FC } from "react";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import AccountIcon from "@mui/icons-material/Person";
import AppearanceIcon from "@mui/icons-material/Brush";
import ScheduleIcon from "@mui/icons-material/EditCalendarOutlined";
import SecurityIcon from "@mui/icons-material/LockOutlined";
import type { User } from "api/typesGenerated";
import { UserAvatar } from "components/UserAvatar/UserAvatar";
import {
  Sidebar as BaseSidebar,
  SidebarHeader,
  SidebarNavItem,
} from "components/Sidebar/Sidebar";
import { GitIcon } from "components/Icons/GitIcon";
import { useDashboard } from "modules/dashboard/useDashboard";

interface SidebarProps {
  user: User;
}

export const Sidebar: FC<SidebarProps> = ({ user }) => {
  const { entitlements } = useDashboard();
  const showSchedulePage =
    entitlements.features.advanced_template_scheduling.enabled;

  return (
    <BaseSidebar>
      <SidebarHeader
        avatar={
          <UserAvatar username={user.username} avatarURL={user.avatar_url} />
        }
        title={user.username}
        subtitle={user.email}
      />
      <SidebarNavItem href="account" icon={AccountIcon}>
        账户
      </SidebarNavItem>
      <SidebarNavItem href="appearance" icon={AppearanceIcon}>
        主题
      </SidebarNavItem>
      <SidebarNavItem href="external-auth" icon={GitIcon}>
        外部验证
      </SidebarNavItem>
      {showSchedulePage && (
        <SidebarNavItem href="schedule" icon={ScheduleIcon}>
          日程安排
        </SidebarNavItem>
      )}
      <SidebarNavItem href="security" icon={SecurityIcon}>
        安全
      </SidebarNavItem>
      <SidebarNavItem href="ssh-keys" icon={FingerprintOutlinedIcon}>
        SSH密钥
      </SidebarNavItem>
      <SidebarNavItem href="tokens" icon={VpnKeyOutlined}>
        令牌
      </SidebarNavItem>
    </BaseSidebar>
  );
};
