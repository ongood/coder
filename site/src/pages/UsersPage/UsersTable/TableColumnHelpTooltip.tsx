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

type ColumnHeader = "roles" | "groups";

type TooltipData = {
  title: string;
  text: string;
  links: readonly { text: string; href: string }[];
};

export const Language = {
  roles: {
    title: "角色是什么？",
    text:
      "Coder基于角色的访问控制（RBAC）提供了细粒度的访问管理。 " +
      "查看我们的文档以了解如何使用可用的角色。",
    links: [{ text: "用户角色", href: docs("/admin/users#roles") }],
  },

  groups: {
    title: "组是什么？",
    text:
      "组可以与模板 RBAC 结合使用，以便给用户组提供对特定模板的访问权限 " +
      "查看我们的文档以了解如何使用组。",
    links: [{ text: "用户组", href: docs("/admin/groups") }],
  },
} as const satisfies Record<ColumnHeader, TooltipData>;

type Props = {
  variant: ColumnHeader;
};

export const TableColumnHelpTooltip: FC<Props> = ({ variant }) => {
  const variantLang = Language[variant];

  return (
    <HelpTooltip>
      <HelpTooltipTrigger size="small" />
      <HelpTooltipContent>
        <HelpTooltipTitle>{variantLang.title}</HelpTooltipTitle>
        <HelpTooltipText>{variantLang.text}</HelpTooltipText>
        <HelpTooltipLinksGroup>
          {variantLang.links.map((link) => (
            <HelpTooltipLink key={link.text} href={link.href}>
              {link.text}
            </HelpTooltipLink>
          ))}
        </HelpTooltipLinksGroup>
      </HelpTooltipContent>
    </HelpTooltip>
  );
};
