import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import ArrowRightAltOutlined from "@material-ui/icons/ArrowRightAltOutlined"
import AddCircleOutline from "@material-ui/icons/AddCircleOutline"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"
import AvatarGroup from "@material-ui/lab/AvatarGroup"
import { AvatarData } from "components/AvatarData/AvatarData"
import { ChooseOne, Cond } from "components/Conditionals/ChooseOne"
import { EmptyState } from "components/EmptyState/EmptyState"
import { Stack } from "components/Stack/Stack"
import { TableLoaderSkeleton } from "components/TableLoader/TableLoader"
import { UserAvatar } from "components/UserAvatar/UserAvatar"
import { FC } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Paywall } from "components/Paywall/Paywall"
import { Group } from "api/typesGenerated"
import { GroupAvatar } from "components/GroupAvatar/GroupAvatar"

export type GroupsPageViewProps = {
  groups: Group[] | undefined
  canCreateGroup: boolean
  isTemplateRBACEnabled: boolean
}

export const GroupsPageView: FC<GroupsPageViewProps> = ({
  groups,
  canCreateGroup,
  isTemplateRBACEnabled,
}) => {
  const isLoading = Boolean(groups === undefined)
  const isEmpty = Boolean(groups && groups.length === 0)
  const navigate = useNavigate()
  const styles = useStyles()

  return (
    <>
      <ChooseOne>
        <Cond condition={!isTemplateRBACEnabled}>
          <Paywall
            message="用户组"
            description="将用户组织成组并管理其权限。要使用此功能，您必须升级您的帐户。"
            cta={
              <Stack direction="row" alignItems="center">
                <Link
                  underline="none"
                  href="https://coder.com/docs/coder-oss/latest/enterprise"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="small" startIcon={<ArrowRightAltOutlined />}>
                    查看如何升级
                  </Button>
                </Link>
                <Link
                  underline="none"
                  href="https://coder.com/docs/coder-oss/latest/admin/groups"
                  target="_blank"
                  rel="noreferrer"
                >
                  阅读文档
                </Link>
              </Stack>
            }
          />
        </Cond>
        <Cond>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50%">名称</TableCell>
                  <TableCell width="49%">用户</TableCell>
                  <TableCell width="1%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <ChooseOne>
                  <Cond condition={isLoading}>
                    <TableLoaderSkeleton columns={2} useAvatarData />
                  </Cond>

                  <Cond condition={isEmpty}>
                    <TableRow>
                      <TableCell colSpan={999}>
                        <EmptyState
                          message="暂无用户组"
                          description={
                            canCreateGroup
                              ? "创建您的第一个用户组"
                              : "您没有权限创建用户组"
                          }
                          cta={
                            canCreateGroup && (
                              <Link
                                underline="none"
                                component={RouterLink}
                                to="/groups/create"
                              >
                                <Button startIcon={<AddCircleOutline />}>
                                  创建用户组
                                </Button>
                              </Link>
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </Cond>

                  <Cond>
                    {groups?.map((group) => {
                      const groupPageLink = `/groups/${group.id}`

                      return (
                        <TableRow
                          hover
                          key={group.id}
                          data-testid={`group-${group.id}`}
                          tabIndex={0}
                          onClick={() => {
                            navigate(groupPageLink)
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              navigate(groupPageLink)
                            }
                          }}
                          className={styles.clickableTableRow}
                        >
                          <TableCell>
                            <AvatarData
                              avatar={
                                <GroupAvatar
                                  name={group.name}
                                  avatarURL={group.avatar_url}
                                />
                              }
                              title={group.name}
                              subtitle={`${group.members.length} members`}
                            />
                          </TableCell>

                          <TableCell>
                            {group.members.length === 0 && "-"}
                            <AvatarGroup>
                              {group.members.map((member) => (
                                <UserAvatar
                                  key={member.username}
                                  username={member.username}
                                  avatarURL={member.avatar_url}
                                />
                              ))}
                            </AvatarGroup>
                          </TableCell>

                          <TableCell>
                            <div className={styles.arrowCell}>
                              <KeyboardArrowRight
                                className={styles.arrowRight}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </Cond>
                </ChooseOne>
              </TableBody>
            </Table>
          </TableContainer>
        </Cond>
      </ChooseOne>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  clickableTableRow: {
    cursor: "pointer",

    "&:hover td": {
      backgroundColor: theme.palette.action.hover,
    },

    "&:focus": {
      outline: `1px solid ${theme.palette.secondary.dark}`,
    },

    "& .MuiTableCell-root:last-child": {
      paddingRight: theme.spacing(2),
    },
  },
  arrowRight: {
    color: theme.palette.text.secondary,
    width: 20,
    height: 20,
  },
  arrowCell: {
    display: "flex",
  },
}))

export default GroupsPageView
