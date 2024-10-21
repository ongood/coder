import Brush from "@mui/icons-material/Brush";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InsertChartIcon from "@mui/icons-material/InsertChart";
import LaunchOutlined from "@mui/icons-material/LaunchOutlined";
import LockRounded from "@mui/icons-material/LockOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Globe from "@mui/icons-material/PublicOutlined";
import ApprovalIcon from "@mui/icons-material/VerifiedUserOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import { GitIcon } from "components/Icons/GitIcon";
import {
	Sidebar as BaseSidebar,
	SidebarNavItem,
} from "components/Sidebar/Sidebar";
import { useDashboard } from "modules/dashboard/useDashboard";
import type { FC } from "react";

export const Sidebar: FC = () => {
	const { experiments } = useDashboard();

	return (
		<BaseSidebar>
			<SidebarNavItem href="general" icon={LaunchOutlined}>
				常规
			</SidebarNavItem>
			<SidebarNavItem href="licenses" icon={ApprovalIcon}>
				许可证
			</SidebarNavItem>
			<SidebarNavItem href="appearance" icon={Brush}>
				外观
			</SidebarNavItem>
			<SidebarNavItem href="userauth" icon={VpnKeyOutlined}>
				用户验证
			</SidebarNavItem>
			<SidebarNavItem href="external-auth" icon={GitIcon}>
				外部验证
			</SidebarNavItem>
			{/* Not exposing this yet since token exchange is not finished yet.
      <SidebarNavItem href="oauth2-provider/apps" icon={Token}>
        OAuth2 Applications
      </SidebarNavItem>*/}
			<SidebarNavItem href="network" icon={Globe}>
				网络
			</SidebarNavItem>
			<SidebarNavItem href="workspace-proxies" icon={HubOutlinedIcon}>
				代理
			</SidebarNavItem>
			<SidebarNavItem href="security" icon={LockRounded}>
				安全
			</SidebarNavItem>
			<SidebarNavItem href="observability" icon={InsertChartIcon}>
				可观测性
			</SidebarNavItem>
			{experiments.includes("notifications") && (
				<SidebarNavItem href="notifications" icon={NotificationsIcon}>
					通知
				</SidebarNavItem>
			)}
		</BaseSidebar>
	);
};
