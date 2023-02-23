import { makeStyles } from "@material-ui/core/styles"
import { Expander } from "components/Expander/Expander"
import { Pill } from "components/Pill/Pill"
import { useState } from "react"
import { colors } from "theme/colors"

export const Language = {
  licenseIssue: "许可证问题",
  licenseIssues: (num: number): string => `${num} 许可证问题`,
  upgrade: "联系我们升级您的许可证。",
  exceeded: "您似乎超出了许可证的某些限制。",
  lessDetails: "少于",
  moreDetails: "多于",
}

export interface LicenseBannerViewProps {
  errors: string[]
  warnings: string[]
}

export const LicenseBannerView: React.FC<LicenseBannerViewProps> = ({
  errors,
  warnings,
}) => {
  const styles = useStyles()
  const [showDetails, setShowDetails] = useState(false)
  const isError = errors.length > 0
  const messages = [...errors, ...warnings]
  const type = isError ? "error" : "warning"

  if (messages.length === 1) {
    return (
      <div className={`${styles.container} ${type}`}>
        <Pill text={Language.licenseIssue} type={type} lightBorder />
        <div className={styles.leftContent}>
          <span>{messages[0]}</span>
          &nbsp;
          <a href="mailto:sales@coder.com" className={styles.link}>
            {Language.upgrade}
          </a>
        </div>
      </div>
    )
  } else {
    return (
      <div className={`${styles.container} ${type}`}>
        <Pill
          text={Language.licenseIssues(messages.length)}
          type={type}
          lightBorder
        />
        <div className={styles.leftContent}>
          <div>
            {Language.exceeded}
            &nbsp;
            <a href="mailto:sales@coder.com" className={styles.link}>
              {Language.upgrade}
            </a>
          </div>
          <Expander expanded={showDetails} setExpanded={setShowDetails}>
            <ul className={styles.list}>
              {messages.map((message) => (
                <li className={styles.listItem} key={`${message}`}>
                  {message}
                </li>
              ))}
            </ul>
          </Expander>
        </div>
      </div>
    )
  }
}

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.warning.main,
    display: "flex",
    alignItems: "center",

    "&.error": {
      backgroundColor: colors.red[12],
    },
  },
  flex: {
    display: "column",
  },
  leftContent: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    fontWeight: 600,
  },
  list: {
    padding: theme.spacing(1),
    margin: 0,
  },
  listItem: {
    margin: theme.spacing(0.5),
  },
}))
