import type { FC } from "react";
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

export const Language = {
  title: "什么是日志？",
  body: "日志是系统中发生的事件和更改的记录。",
  docs: "我们跟踪的事件",
};

export const AuditHelpTooltip: FC = () => {
  return (
    <HelpTooltip>
      <HelpTooltipTrigger />

      <HelpTooltipContent>
        <HelpTooltipTitle>{Language.title}</HelpTooltipTitle>
        <HelpTooltipText>{Language.body}</HelpTooltipText>
        <HelpTooltipLinksGroup>
          <HelpTooltipLink href={docs("/admin/audit-logs")}>
            {Language.docs}
          </HelpTooltipLink>
        </HelpTooltipLinksGroup>
      </HelpTooltipContent>
    </HelpTooltip>
  );
};
