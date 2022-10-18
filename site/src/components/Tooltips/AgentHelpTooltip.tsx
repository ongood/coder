import {
  HelpTooltip,
  HelpTooltipText,
  HelpTooltipTitle,
} from "./HelpTooltip/HelpTooltip"

export const Language = {
  agentTooltipTitle: "什么是代理？",
  agentTooltipText:
    "Coder 代理在您的资源中运行，并让您可以通过 UI 或 CLI 直接访问 shell。",
}

export const AgentHelpTooltip: React.FC = () => {
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.agentTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.agentTooltipText}</HelpTooltipText>
    </HelpTooltip>
  )
}
