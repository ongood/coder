import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import GroupAdd from "@material-ui/icons/GroupAddOutlined"
import PersonAdd from "@material-ui/icons/PersonAddOutlined"
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader"
import { useFeatureVisibility } from "hooks/useFeatureVisibility"
import { usePermissions } from "hooks/usePermissions"
import { FC, PropsWithChildren } from "react"
import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom"
import { combineClasses } from "util/combineClasses"
import { Margins } from "../../components/Margins/Margins"
import { Stack } from "../../components/Stack/Stack"

export const UsersLayout: FC<PropsWithChildren> = ({ children }) => {
  const styles = useStyles()
  const { createUser: canCreateUser, createGroup: canCreateGroup } =
    usePermissions()
  const navigate = useNavigate()
  const { template_rbac: isTemplateRBACEnabled } = useFeatureVisibility()

  return (
    <>
      <Margins>
        <PageHeader
          actions={
            <>
              {canCreateUser && (
                <Button
                  onClick={() => {
                    navigate("/users/create")
                  }}
                  startIcon={<PersonAdd />}
                >
                  创建用户
                </Button>
              )}
              {canCreateGroup && isTemplateRBACEnabled && (
                <Link
                  underline="none"
                  component={RouterLink}
                  to="/groups/create"
                >
                  <Button startIcon={<GroupAdd />}>创建用户组</Button>
                </Link>
              )}
            </>
          }
        >
          <PageHeaderTitle>Users</PageHeaderTitle>
        </PageHeader>
      </Margins>

      <div className={styles.tabs}>
        <Margins>
          <Stack direction="row" spacing={0.25}>
            <NavLink
              end
              to="/users"
              className={({ isActive }) =>
                combineClasses([
                  styles.tabItem,
                  isActive ? styles.tabItemActive : undefined,
                ])
              }
            >
              用户
            </NavLink>
            <NavLink
              to="/groups"
              className={({ isActive }) =>
                combineClasses([
                  styles.tabItem,
                  isActive ? styles.tabItemActive : undefined,
                ])
              }
            >
              用户组
            </NavLink>
          </Stack>
        </Margins>
      </div>

      <Margins>{children}</Margins>
    </>
  )
}

export const useStyles = makeStyles((theme) => {
  return {
    tabs: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      marginBottom: theme.spacing(5),
    },

    tabItem: {
      textDecoration: "none",
      color: theme.palette.text.secondary,
      fontSize: 14,
      display: "block",
      padding: theme.spacing(0, 2, 2),

      "&:hover": {
        color: theme.palette.text.primary,
      },
    },

    tabItemActive: {
      color: theme.palette.text.primary,
      position: "relative",

      "&:before": {
        content: `""`,
        left: 0,
        bottom: 0,
        height: 2,
        width: "100%",
        background: theme.palette.secondary.dark,
        position: "absolute",
      },
    },
  }
})
