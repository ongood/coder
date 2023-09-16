import { FC } from "react";
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "components/HelpTooltip/HelpTooltip";
import { docs } from "utils/docs";

const Language = {
  workspaceTooltipTitle: "什么是工作区",
  workspaceTooltipText:
    "工作区是您在云端的开发环境。 它包括您在项目上工作所需的基础设施和开发工具。",
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
        <HelpTooltipLink href={docs("/workspaces#create-workspaces")}>
          {Language.workspaceTooltipLink1}
        </HelpTooltipLink>
        <HelpTooltipLink href={docs("/workspaces#connect-with-ssh")}>
          {Language.workspaceTooltipLink2}
        </HelpTooltipLink>
        <HelpTooltipLink href={docs("/workspaces#editors-and-ides")}>
          {Language.workspaceTooltipLink3}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  );
};
