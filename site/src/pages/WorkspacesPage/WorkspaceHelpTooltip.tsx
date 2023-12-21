import { FC } from "react";
import {
  HelpTooltip,
  HelpTooltipContent,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
  HelpTooltipTrigger,
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
      <HelpTooltipTrigger />
      <HelpTooltipContent>
        <HelpTooltipTitle>{Language.workspaceTooltipTitle}</HelpTooltipTitle>
        <HelpTooltipText>{Language.workspaceTooltipText}</HelpTooltipText>
        <HelpTooltipLinksGroup>
          <HelpTooltipLink href={docs("/workspaces")}>
            {Language.workspaceTooltipLink1}
          </HelpTooltipLink>
          <HelpTooltipLink href={docs("/ides")}>
            {Language.workspaceTooltipLink2}
          </HelpTooltipLink>
        </HelpTooltipLinksGroup>
      </HelpTooltipContent>
    </HelpTooltip>
  );
};
