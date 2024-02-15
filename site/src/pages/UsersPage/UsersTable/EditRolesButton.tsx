import { type Interpolation, type Theme } from "@emotion/react";
import IconButton from "@mui/material/IconButton";
import { EditSquare } from "components/Icons/EditSquare";
import { type FC } from "react";
import { Stack } from "components/Stack/Stack";
import Checkbox from "@mui/material/Checkbox";
import UserIcon from "@mui/icons-material/PersonOutline";
import { Role } from "api/typesGenerated";
import {
  HelpTooltip,
  HelpTooltipContent,
  HelpTooltipText,
  HelpTooltipTitle,
  HelpTooltipTrigger,
} from "components/HelpTooltip/HelpTooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/Popover/Popover";
import { type ClassName, useClassName } from "hooks/useClassName";

const roleDescriptions: Record<string, string> = {
  owner:
    "拥有者可以管理所有资源，包括用户、群组、模板和工作区。",
  "user-admin": "用户管理员可以管理所有用户和群组。",
  "template-admin": "模板管理员可以管理所有模板和工作区。",
  auditor: "审计员可以访问审计日志。",
  member:
    "任何用户都是成员。这是所有用户的权利和默认角色。",
};

interface OptionProps {
  value: string;
  name: string;
  description: string;
  isChecked: boolean;
  onChange: (roleName: string) => void;
}

const Option: FC<OptionProps> = ({
  value,
  name,
  description,
  isChecked,
  onChange,
}) => {
  return (
    <label htmlFor={name} css={styles.option}>
      <Stack direction="row" alignItems="flex-start">
        <Checkbox
          id={name}
          size="small"
          css={styles.checkbox}
          value={value}
          checked={isChecked}
          onChange={(e) => {
            onChange(e.currentTarget.value);
          }}
        />
        <Stack spacing={0}>
          <strong>{name}</strong>
          <span css={styles.optionDescription}>{description}</span>
        </Stack>
      </Stack>
    </label>
  );
};

export interface EditRolesButtonProps {
  isLoading: boolean;
  roles: Role[];
  selectedRoleNames: Set<string>;
  onChange: (roles: Role["name"][]) => void;
  isDefaultOpen?: boolean;
  oidcRoleSync: boolean;
  userLoginType: string;
}

export const EditRolesButton: FC<EditRolesButtonProps> = ({
  roles,
  selectedRoleNames,
  onChange,
  isLoading,
  isDefaultOpen = false,
  userLoginType,
  oidcRoleSync,
}) => {
  const paper = useClassName(classNames.paper, []);

  const handleChange = (roleName: string) => {
    if (selectedRoleNames.has(roleName)) {
      const serialized = [...selectedRoleNames];
      onChange(serialized.filter((role) => role !== roleName));
      return;
    }

    onChange([...selectedRoleNames, roleName]);
  };

  const canSetRoles =
    userLoginType !== "oidc" || (userLoginType === "oidc" && !oidcRoleSync);

  if (!canSetRoles) {
    return (
      <HelpTooltip>
        <HelpTooltipTrigger size="small" />
        <HelpTooltipContent>
          <HelpTooltipTitle>外部控制</HelpTooltipTitle>
          <HelpTooltipText>
            此用户的角色由 OIDC 身份提供者控制。
          </HelpTooltipText>
        </HelpTooltipContent>
      </HelpTooltip>
    );
  }

  return (
    <Popover isDefaultOpen={isDefaultOpen}>
      <PopoverTrigger>
        <IconButton
          size="small"
          css={styles.editButton}
          title="编辑用户角色"
        >
          <EditSquare />
        </IconButton>
      </PopoverTrigger>

      <PopoverContent classes={{ paper }}>
        <fieldset
          css={styles.fieldset}
          disabled={isLoading}
          title="可用角色"
        >
          <Stack css={styles.options} spacing={3}>
            {roles.map((role) => (
              <Option
                key={role.name}
                onChange={handleChange}
                isChecked={selectedRoleNames.has(role.name)}
                value={role.name}
                name={role.display_name}
                description={roleDescriptions[role.name] ?? ""}
              />
            ))}
          </Stack>
        </fieldset>
        <div css={styles.footer}>
          <Stack direction="row" alignItems="flex-start">
            <UserIcon css={styles.userIcon} />
            <Stack spacing={0}>
              <strong>成员</strong>
              <span css={styles.optionDescription}>
                {roleDescriptions.member}
              </span>
            </Stack>
          </Stack>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const classNames = {
  paper: (css, theme) => css`
    width: 360px;
    margin-top: 8px;
    background: ${theme.palette.background.paper};
  `,
} satisfies Record<string, ClassName>;

const styles = {
  editButton: (theme) => ({
    color: theme.palette.text.secondary,

    "& .MuiSvgIcon-root": {
      width: 16,
      height: 16,
      position: "relative",
      top: -2, // Align the pencil square
    },

    "&:hover": {
      color: theme.palette.text.primary,
      backgroundColor: "transparent",
    },
  }),
  fieldset: {
    border: 0,
    margin: 0,
    padding: 0,

    "&:disabled": {
      opacity: 0.5,
    },
  },
  options: {
    padding: 24,
  },
  option: {
    cursor: "pointer",
    fontSize: 14,
  },
  checkbox: {
    padding: 0,
    position: "relative",
    top: 1, // Alignment

    "& svg": {
      width: 20,
      height: 20,
    },
  },
  optionDescription: (theme) => ({
    fontSize: 13,
    color: theme.palette.text.secondary,
    lineHeight: "160%",
  }),
  footer: (theme) => ({
    padding: 24,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    fontSize: 14,
  }),
  userIcon: (theme) => ({
    width: 20, // Same as the checkbox
    height: 20,
    color: theme.palette.primary.main,
  }),
} satisfies Record<string, Interpolation<Theme>>;
