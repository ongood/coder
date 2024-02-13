import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { type FC } from "react";
import { useTheme } from "@emotion/react";
import type { GitSSHKey } from "api/typesGenerated";
import { CodeExample } from "components/CodeExample/CodeExample";
import { Stack } from "components/Stack/Stack";
import { ErrorAlert } from "components/Alert/ErrorAlert";

export interface SSHKeysPageViewProps {
  isLoading: boolean;
  getSSHKeyError?: unknown;
  sshKey?: GitSSHKey;
  onRegenerateClick: () => void;
}

export const SSHKeysPageView: FC<SSHKeysPageViewProps> = ({
  isLoading,
  getSSHKeyError,
  sshKey,
  onRegenerateClick,
}) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <div css={{ padding: 32 }}>
        <CircularProgress size={26} />
      </div>
    );
  }

  return (
    <Stack>
      {/* Regenerating the key is not an option if getSSHKey fails.
        Only one of the error messages will exist at a single time */}
      {Boolean(getSSHKeyError) && <ErrorAlert error={getSSHKeyError} />}

      {sshKey && (
        <>
          <p
            css={{
              fontSize: 14,
              color: theme.palette.text.secondary,
              margin: 0,
            }}
          >
            以下公钥用于在工作区中对 Git 进行身份验证。您可以将其添加到您需要从工作区访问的 Git 服务（例如 GitHub）中。Coder 通过 <code
              css={{
                background: theme.palette.divider,
                fontSize: 12,
                padding: "2px 4px",
                color: theme.palette.text.primary,
                borderRadius: 2,
              }}
            >
              $GIT_SSH_COMMAND
            </code>
            进行身份验证配置。
          </p>
          <CodeExample secret={false} code={sshKey.public_key.trim()} />
          <div>
            <Button onClick={onRegenerateClick} data-testid="regenerate">
              重新生成&hellip;
            </Button>
          </div>
        </>
      )}
    </Stack>
  );
};
