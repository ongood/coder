import { makeStyles } from "@mui/styles"
import Brush from "@mui/icons-material/Brush"
import LaunchOutlined from "@mui/icons-material/LaunchOutlined"
import ApprovalIcon from "@mui/icons-material/VerifiedUserOutlined"
import LockRounded from "@mui/icons-material/LockOutlined"
import Globe from "@mui/icons-material/PublicOutlined"
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined"
import { GitIcon } from "components/Icons/GitIcon"
import { Stack } from "components/Stack/Stack"
import { ElementType, PropsWithChildren, ReactNode, FC } from "react"
import { NavLink } from "react-router-dom"
import { combineClasses } from "utils/combineClasses"

const SidebarNavItem: FC<
  PropsWithChildren<{ href: string; icon: ReactNode }>
> = ({ children, href, icon }) => {
  const styles = useStyles()
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        combineClasses([
          styles.sidebarNavItem,
          isActive ? styles.sidebarNavItemActive : undefined,
        ])
      }
    >
      <Stack alignItems="center" spacing={1.5} direction="row">
        {icon}
        {children}
      </Stack>
    </NavLink>
  )
}

const SidebarNavItemIcon: FC<{ icon: ElementType }> = ({ icon: Icon }) => {
  const styles = useStyles()
  return <Icon className={styles.sidebarNavItemIcon} />
}

export const Sidebar: React.FC = () => {
  const styles = useStyles()

  return (
    <nav className={styles.sidebar}>
      <SidebarNavItem
        href="general"
        icon={<SidebarNavItemIcon icon={LaunchOutlined} />}
      >
        常规
      </SidebarNavItem>
      <SidebarNavItem
        href="licenses"
        icon={<SidebarNavItemIcon icon={ApprovalIcon} />}
      >
        许可证
      </SidebarNavItem>
      <SidebarNavItem
        href="appearance"
        icon={<SidebarNavItemIcon icon={Brush} />}
      >
        外观
      </SidebarNavItem>
      <SidebarNavItem
        href="userauth"
        icon={<SidebarNavItemIcon icon={VpnKeyOutlined} />}
      >
        用户身份验证
      </SidebarNavItem>
      <SidebarNavItem
        href="gitauth"
        icon={<SidebarNavItemIcon icon={GitIcon} />}
      >
        Git 身份验证
      </SidebarNavItem>
      <SidebarNavItem href="network" icon={<SidebarNavItemIcon icon={Globe} />}>
        网络
      </SidebarNavItem>
      <SidebarNavItem
        href="security"
        icon={<SidebarNavItemIcon icon={LockRounded} />}
      >
        安全
      </SidebarNavItem>
    </nav>
  )
}

const useStyles = makeStyles((theme) => ({
  sidebar: {
    width: 245,
  },

  sidebarNavItem: {
    color: "inherit",
    display: "block",
    fontSize: 14,
    textDecoration: "none",
    padding: theme.spacing(1.5, 1.5, 1.5, 2),
    borderRadius: theme.shape.borderRadius / 2,
    transition: "background-color 0.15s ease-in-out",
    marginBottom: 1,
    position: "relative",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },

  sidebarNavItemActive: {
    backgroundColor: theme.palette.action.hover,

    "&:before": {
      content: '""',
      display: "block",
      width: 3,
      height: "100%",
      position: "absolute",
      left: 0,
      top: 0,
      backgroundColor: theme.palette.secondary.dark,
      borderTopLeftRadius: theme.shape.borderRadius,
      borderBottomLeftRadius: theme.shape.borderRadius,
    },
  },

  sidebarNavItemIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
}))
