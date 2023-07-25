import { FC } from "react"
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "./HelpTooltip"
import { docs } from "utils/docs"

export const Language = {
  title: "什么是审计日志？",
  body: "审计日志是整个系统中发生的事件和更改的记录。",
  docs: "审计日志",
}

export const AuditHelpTooltip: FC = () => {
  return (
    <HelpTooltip>
      <HelpTooltipTitle>{Language.title}</HelpTooltipTitle>
      <HelpTooltipText>{Language.body}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href={docs("/admin/audit-logs")}>
          {Language.docs}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}
