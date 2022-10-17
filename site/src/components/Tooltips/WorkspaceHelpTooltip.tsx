import { FC } from "react"
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "./HelpTooltip"

const Language = {
  workspaceTooltipTitle: "什么是工作区",
  workspaceTooltipText:
    "工作区是您在云中的开发环境。 它包括您在项目上工作所需的基础设施和工具。",
  workspaceTooltipLink1: "创建工作区",
  workspaceTooltipLink2: "通过SSH连接",
  workspaceTooltipLink3: "编辑器和IDEs",
}

export const WorkspaceHelpTooltip: FC = () => {
  return (
    <HelpTooltip>
      <HelpTooltipTitle>{Language.workspaceTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.workspaceTooltipText}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/workspaces#create-workspaces">
          {Language.workspaceTooltipLink1}
        </HelpTooltipLink>
        <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/workspaces#connect-with-ssh">
          {Language.workspaceTooltipLink2}
        </HelpTooltipLink>
        <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/workspaces#editors-and-ides">
          {Language.workspaceTooltipLink3}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}
