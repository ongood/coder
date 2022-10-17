import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "./HelpTooltip/HelpTooltip"

export const Language = {
  resourceTooltipTitle: "什么是资源？",
  resourceTooltipText:
    "资源是在构建工作空间时创建的基础结构对象。",
  resourceTooltipLink: "持久资源与临时资源",
}

export const ResourcesHelpTooltip: React.FC = () => {
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.resourceTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.resourceTooltipText}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/templates#persistent-vs-ephemeral-resources">
          {Language.resourceTooltipLink}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}
