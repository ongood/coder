import type { Interpolation, Theme } from "@emotion/react";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import type { FC } from "react";
import { CodeExample } from "components/CodeExample/CodeExample";
import {
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
} from "components/HelpTooltip/HelpTooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/Popover/Popover";
import { Stack } from "components/Stack/Stack";
import { type ClassName, useClassName } from "hooks/useClassName";
import { docs } from "utils/docs";

export interface SSHButtonProps {
  workspaceName: string;
  agentName: string;
  isDefaultOpen?: boolean;
  sshPrefix?: string;
}

export const SSHButton: FC<SSHButtonProps> = ({
  workspaceName,
  agentName,
  isDefaultOpen = false,
  sshPrefix,
}) => {
  const paper = useClassName(classNames.paper, []);

  return (
    <Popover isDefaultOpen={isDefaultOpen}>
      <PopoverTrigger>
        <Button
          size="small"
          variant="text"
          endIcon={<KeyboardArrowDown />}
          css={{ fontSize: 13, padding: "8px 12px" }}
        >
          通过 SSH 连接
        </Button>
      </PopoverTrigger>

      <PopoverContent horizontal="right" classes={{ paper }}>
        <HelpTooltipText>
          运行以下命令以通过SSH连接
        </HelpTooltipText>

        <Stack spacing={0.5} css={styles.codeExamples}>
          <div>
            <HelpTooltipText>
              <strong css={styles.codeExampleLabel}>
                在机器上配置 SSH 主机:
              </strong>
            </HelpTooltipText>
            <CodeExample secret={false} code="coder config-ssh" />
          </div>

          <div>
            <HelpTooltipText>
              <strong css={styles.codeExampleLabel}>
                连接到代理:
              </strong>
            </HelpTooltipText>
            <CodeExample
              secret={false}
              code={`ssh ${sshPrefix}${workspaceName}.${agentName}`}
            />
          </div>
        </Stack>

        <HelpTooltipLinksGroup>
          <HelpTooltipLink href={docs("/install")}>
            安装Coder CLI
          </HelpTooltipLink>
          <HelpTooltipLink href={docs("/ides#vs-code-remote")}>
            通过VS Code远程SSH连接
          </HelpTooltipLink>
          <HelpTooltipLink href={docs("/ides#jetbrains-gateway")}>
            通过JetBrains Gateway连接
          </HelpTooltipLink>
          <HelpTooltipLink href={docs("/ides#ssh-configuration")}>
            SSH配置
          </HelpTooltipLink>
        </HelpTooltipLinksGroup>
      </PopoverContent>
    </Popover>
  );
};

const classNames = {
  paper: (css, theme) => css`
    padding: 16px 24px 24px;
    width: 304px;
    color: ${theme.palette.text.secondary};
    margin-top: 2px;
  `,
} satisfies Record<string, ClassName>;

const styles = {
  codeExamples: {
    marginTop: 12,
  },

  codeExampleLabel: {
    fontSize: 12,
  },
} satisfies Record<string, Interpolation<Theme>>;
