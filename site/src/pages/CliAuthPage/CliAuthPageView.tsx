import Button from "@mui/material/Button"
import { makeStyles } from "@mui/styles"
import { CodeExample } from "components/CodeExample/CodeExample"
import { SignInLayout } from "components/SignInLayout/SignInLayout"
import { Welcome } from "components/Welcome/Welcome"
import { FC } from "react"
import { Link as RouterLink } from "react-router-dom"
import { FullScreenLoader } from "../../components/Loader/FullScreenLoader"

export interface CliAuthPageViewProps {
  sessionToken: string | null
}

export const CliAuthPageView: FC<CliAuthPageViewProps> = ({ sessionToken }) => {
  const styles = useStyles()

  if (!sessionToken) {
    return <FullScreenLoader />
  }

  return (
    <SignInLayout>
      <Welcome message="会话令牌" />

      <p className={styles.text}>
          将下面的会话令牌复制并{" "}
        <strong className={styles.lineBreak}>粘贴到您的终端</strong>.
      </p>

      <CodeExample code={sessionToken} />

      <div className={styles.links}>
        <Button component={RouterLink} size="large" to="/workspaces" fullWidth>
          前往工作区
        </Button>
      </div>
    </SignInLayout>
  )
}

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: theme.spacing(4),
    fontWeight: 400,
    lineHeight: "140%",
    margin: 0,
  },

  text: {
    fontSize: 16,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4),
    textAlign: "center",
    lineHeight: "160%",
  },

  lineBreak: {
    whiteSpace: "nowrap",
  },

  links: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.spacing(1),
  },
}))
