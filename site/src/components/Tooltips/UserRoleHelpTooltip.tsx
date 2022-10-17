import { FC } from "react"
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "./HelpTooltip"

export const Language = {
  title: "什么是角色？",
  text:
    "Coder 基于角色的访问控制 (RBAC) 提供了细粒度的访问管理。" +
    "查看我们的文档，了解如何使用可用角色。",
  link: "用户角色",
}

export const UserRoleHelpTooltip: FC = () => {
  return (
    <HelpTooltip size="small">
      <HelpTooltipTitle>{Language.title}</HelpTooltipTitle>
      <HelpTooltipText>{Language.text}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/admin/users#roles">
          {Language.link}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}
