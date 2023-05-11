import { makeStyles } from "@material-ui/core/styles"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import CircularProgress from "@material-ui/core/CircularProgress"
import { GitSSHKey } from "api/typesGenerated"
import { AlertBanner } from "components/AlertBanner/AlertBanner"
import { CodeExample } from "components/CodeExample/CodeExample"
import { Stack } from "components/Stack/Stack"
import { FC } from "react"

export const Language = {
  errorRegenerateSSHKey: "重新生成 SSH 密钥时出错",
  regenerateLabel: "重新生成",
}

export interface SSHKeysPageViewProps {
  isLoading: boolean
  hasLoaded: boolean
  getSSHKeyError?: Error | unknown
  regenerateSSHKeyError?: Error | unknown
  sshKey?: GitSSHKey
  onRegenerateClick: () => void
}

export const SSHKeysPageView: FC<
  React.PropsWithChildren<SSHKeysPageViewProps>
> = ({
  isLoading,
  hasLoaded,
  getSSHKeyError,
  regenerateSSHKeyError,
  sshKey,
  onRegenerateClick,
}) => {
  const styles = useStyles()

  if (isLoading) {
    return (
      <Box p={4}>
        <CircularProgress size={26} />
      </Box>
    )
  }

  return (
    <Stack>
      {/* Regenerating the key is not an option if getSSHKey fails.
        Only one of the error messages will exist at a single time */}
      {Boolean(getSSHKeyError) && (
        <AlertBanner severity="error" error={getSSHKeyError} />
      )}
      {Boolean(regenerateSSHKeyError) && (
        <AlertBanner
          severity="error"
          error={regenerateSSHKeyError}
          text={Language.errorRegenerateSSHKey}
          dismissible
        />
      )}
      {hasLoaded && sshKey && (
        <>
          <p className={styles.description}>
          下面的公钥用于在工作区中进行Git身份验证。您可以将其添加到需要从工作区访问的Git服务（如GitHub）中。Coder通过{" "}
            <code className={styles.code}>$GIT_SSH_COMMAND</code>配置身份验证。
          </p>
          <CodeExample code={sshKey.public_key.trim()} />
          <div>
            <Button onClick={onRegenerateClick}>
              {Language.regenerateLabel}
            </Button>
          </div>
        </>
      )}
    </Stack>
  )
}

const useStyles = makeStyles((theme) => ({
  description: {
    fontSize: 14,
    color: theme.palette.text.secondary,
    margin: 0,
  },
  code: {
    background: theme.palette.divider,
    fontSize: 12,
    padding: "2px 4px",
    color: theme.palette.text.primary,
    borderRadius: 2,
  },
}))
