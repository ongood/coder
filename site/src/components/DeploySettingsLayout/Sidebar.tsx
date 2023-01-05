import { makeStyles } from "@material-ui/core/styles"
import Brush from "@material-ui/icons/Brush"
import LaunchOutlined from "@material-ui/icons/LaunchOutlined"
import LockRounded from "@material-ui/icons/LockRounded"
import Globe from "@material-ui/icons/Public"
import VpnKeyOutlined from "@material-ui/icons/VpnKeyOutlined"
import { GitIcon } from "components/Icons/GitIcon"
import { Stack } from "components/Stack/Stack"
import React, { ElementType, PropsWithChildren, ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { combineClasses } from "util/combineClasses"

const SidebarNavItem: React.FC<
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

const SidebarNavItemIcon: React.FC<{ icon: ElementType }> = ({
  icon: Icon,
}) => {
  const styles = useStyles()
  return <Icon className={styles.sidebarNavItemIcon} />
}

export const Sidebar: React.FC = () => {
  const styles = useStyles()

  return (
    <nav className={styles.sidebar}>
      <SidebarNavItem
        href="../general"
        icon={<SidebarNavItemIcon icon={LaunchOutlined} />}
      >
        常规
      </SidebarNavItem>
      <SidebarNavItem
        href="../appearance"
        icon={<SidebarNavItemIcon icon={Brush} />}
      >
        Appearance
      </SidebarNavItem>
      <SidebarNavItem
        href="../userauth"
        icon={<SidebarNavItemIcon icon={VpnKeyOutlined} />}
      >
        用户身份验证
      </SidebarNavItem>
      <SidebarNavItem
        href="../gitauth"
        icon={<SidebarNavItemIcon icon={GitIcon} />}
      >
        Git 身份验证
      </SidebarNavItem>
      <SidebarNavItem
        href="../network"
        icon={<SidebarNavItemIcon icon={Globe} />}
      >
        网络
      </SidebarNavItem>
      <SidebarNavItem
        href="../security"
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
    fontSize: 16,
    textDecoration: "none",
    padding: theme.spacing(1.5, 1.5, 1.5, 3),
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
      borderRadius: theme.shape.borderRadius,
    },
  },

  sidebarNavItemIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
}))
