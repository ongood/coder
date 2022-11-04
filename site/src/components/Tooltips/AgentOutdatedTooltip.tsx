import { FC } from "react"
import { HelpTooltip, HelpTooltipText, HelpTooltipTitle } from "./HelpTooltip"

export const Language = {
  label: "代理已过时",
  text: "此代理的版本比 Coder 服务器的旧。 这可能在您使用正在运行的工作区更新 Coder 后发生。 要解决此问题，您可以停止并重启工作区。",
}

interface TooltipProps {
  outdated: boolean
}

export const AgentOutdatedTooltip: FC<
  React.PropsWithChildren<TooltipProps>
> = ({ outdated }) => {
  if (!outdated) {
    return null
  }
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.label}</HelpTooltipTitle>
      <HelpTooltipText>{Language.text}</HelpTooltipText>
    </HelpTooltip>
  )
}
