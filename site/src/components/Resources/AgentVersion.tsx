import { useRef, useState, FC } from "react"
import { makeStyles } from "@material-ui/core/styles"
import {
  HelpTooltipText,
  HelpPopover,
  HelpTooltipTitle,
} from "components/Tooltips/HelpTooltip"
import { WorkspaceAgent } from "api/typesGenerated"
import { getDisplayVersionStatus } from "util/workspace"

export const AgentVersion: FC<{
  agent: WorkspaceAgent
  serverVersion: string
}> = ({ agent, serverVersion }) => {
  const styles = useStyles()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const id = isOpen ? "version-outdated-popover" : undefined
  const { displayVersion, outdated } = getDisplayVersionStatus(
    agent.version,
    serverVersion,
  )

  if (!outdated) {
    return <span>{displayVersion}</span>
  }

  return (
    <>
      <span
        role="presentation"
        aria-label="latency"
        ref={anchorRef}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={styles.trigger}
      >
        代理过时
      </span>
      <HelpPopover
        id={id}
        open={isOpen}
        anchorEl={anchorRef.current}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      >
        <HelpTooltipTitle>代理过时</HelpTooltipTitle>
        <HelpTooltipText>
          此代理的版本比 Coder 服务器的版本旧。
          当前正在运行的工作区如果更新编码器后，可能会发生这种情况。
          要解决此问题，你可以停止并重启工作区。
        </HelpTooltipText>
      </HelpPopover>
    </>
  )
}

const useStyles = makeStyles(() => ({
  trigger: {
    cursor: "pointer",
  },
}))
