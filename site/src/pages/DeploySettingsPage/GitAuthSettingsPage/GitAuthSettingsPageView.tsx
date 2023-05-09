import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import { DeploymentValues, GitAuthConfig } from "api/typesGenerated"
import { AlertBanner } from "components/AlertBanner/AlertBanner"
import { EnterpriseBadge } from "components/DeploySettingsLayout/Badges"
import { Header } from "components/DeploySettingsLayout/Header"

export type GitAuthSettingsPageViewProps = {
  config: DeploymentValues
}

export const GitAuthSettingsPageView = ({
  config,
}: GitAuthSettingsPageViewProps): JSX.Element => {
  const styles = useStyles()

  return (
    <>
      <Header
        title="Git身份验证"
        description="Coder 与 GitHub、GitLab、BitBucket 和 Azure Repos 集成，以向你的 Git 提供商验证开发人员的身份。"
        docsHref="https://coder.com/docs/coder-oss/latest/admin/git-providers"
      />

      <video
        autoPlay
        muted
        loop
        playsInline
        src="/gitauth.mp4"
        style={{
          maxWidth: "100%",
          borderRadius: 4,
        }}
      />

      <div className={styles.description}>
        <AlertBanner
          severity="info"
          text="与多个 Git 提供商集成是一项企业版功能。"
          actions={[<EnterpriseBadge key="enterprise" />]}
        />
      </div>

      <TableContainer>
        <Table className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell width="25%">Type</TableCell>
              <TableCell width="25%">Client ID</TableCell>
              <TableCell width="25%">Match</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {((config.git_auth === null || config.git_auth.length === 0) && (
              <TableRow>
                <TableCell colSpan={999}>
                  <div className={styles.empty}>
                     尚未配置任何提供程序！
                  </div>
                </TableCell>
              </TableRow>
            )) ||
              config.git_auth.map((git: GitAuthConfig) => {
                const name = git.id || git.type
                return (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{git.client_id}</TableCell>
                    <TableCell>{git.regex || "Not Set"}</TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  table: {
    "& td": {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    },

    "& td:last-child, & th:last-child": {
      paddingLeft: theme.spacing(4),
    },
  },
  description: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  empty: {
    textAlign: "center",
  },
}))
