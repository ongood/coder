import Popover from "@mui/material/Popover"
import { makeStyles } from "@mui/styles"
import { SecondaryAgentButton } from "components/Resources/AgentButton"
import { useRef, useState } from "react"
import { CodeExample } from "../CodeExample/CodeExample"
import { Stack } from "../Stack/Stack"
import {
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
} from "../Tooltips/HelpTooltip"

export interface SSHButtonProps {
  workspaceName: string
  agentName: string
  defaultIsOpen?: boolean
  sshPrefix?: string
}

export const SSHButton: React.FC<React.PropsWithChildren<SSHButtonProps>> = ({
  workspaceName,
  agentName,
  defaultIsOpen = false,
  sshPrefix,
}) => {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(defaultIsOpen)
  const id = isOpen ? "schedule-popover" : undefined
  const styles = useStyles()

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <SecondaryAgentButton
        ref={anchorRef}
        onClick={() => {
          setIsOpen(true)
        }}
      >
        SSH
      </SecondaryAgentButton>

      <Popover
        classes={{ paper: styles.popoverPaper }}
        id={id}
        open={isOpen}
        anchorEl={anchorRef.current}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <HelpTooltipText>
          运行以下命令以通过SSH连接
        </HelpTooltipText>

        <Stack spacing={0.5} className={styles.codeExamples}>
          <div>
            <HelpTooltipText>
              <strong className={styles.codeExampleLabel}>
                在机器上配置SSH主机：
              </strong>
            </HelpTooltipText>
            <CodeExample code="coder config-ssh" />
          </div>

          <div>
            <HelpTooltipText>
              <strong className={styles.codeExampleLabel}>
                连接到代理服务器：
              </strong>
            </HelpTooltipText>
            <CodeExample
              code={`ssh ${sshPrefix}${workspaceName}.${agentName}`}
            />
          </div>
        </Stack>

        <HelpTooltipLinksGroup>
          <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/install">
            安装Coder CLI
          </HelpTooltipLink>
          <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/ides#vs-code-remote">
            通过VS Code远程SSH连接
          </HelpTooltipLink>
          <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/ides#jetbrains-gateway">
            通过JetBrains Gateway连接
          </HelpTooltipLink>
          <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/ides#ssh-configuration">
            SSH配置
          </HelpTooltipLink>
        </HelpTooltipLinksGroup>
      </Popover>
    </>
  )
}

const useStyles = makeStyles((theme) => ({
  popoverPaper: {
    padding: `${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(3)}`,
    width: theme.spacing(38),
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.25),
  },

  codeExamples: {
    marginTop: theme.spacing(1.5),
  },

  codeExampleLabel: {
    fontSize: 12,
  },

  textHelper: {
    fontWeight: 400,
  },
}))
