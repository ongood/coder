import { Workspace, CreateWorkspaceBuildRequest } from "api/typesGenerated";
import { type FC, type FormEvent, useId, useState } from "react";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { type Interpolation, type Theme } from "@emotion/react";
import TextField from "@mui/material/TextField";
import { docs } from "utils/docs";
import Link from "@mui/material/Link";
import Checkbox from "@mui/material/Checkbox";

interface WorkspaceDeleteDialogProps {
  workspace: Workspace;
  canUpdateTemplate: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: (arg: CreateWorkspaceBuildRequest["orphan"]) => void;
  workspaceBuildDateStr: string;
}

export const WorkspaceDeleteDialog: FC<WorkspaceDeleteDialogProps> = ({
  workspace,
  canUpdateTemplate,
  isOpen,
  onCancel,
  onConfirm,
  workspaceBuildDateStr,
}) => {
  const hookId = useId();
  const [userConfirmationText, setUserConfirmationText] = useState("");
  const [orphanWorkspace, setOrphanWorkspace] =
    useState<CreateWorkspaceBuildRequest["orphan"]>(false);
  const [isFocused, setIsFocused] = useState(false);

  const deletionConfirmed = workspace.name === userConfirmationText;
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (deletionConfirmed) {
      onConfirm(orphanWorkspace);
    }
  };

  const hasError = !deletionConfirmed && userConfirmationText.length > 0;
  const displayErrorMessage = hasError && !isFocused;
  const inputColor = hasError ? "error" : "primary";

  return (
    <ConfirmDialog
      type="delete"
      hideCancel={false}
      open={isOpen}
      title="删除工作区"
      onConfirm={() => onConfirm(orphanWorkspace)}
      onClose={onCancel}
      disabled={!deletionConfirmed}
      description={
        <>
          <div css={styles.workspaceInfo}>
            <div>
              <p className="name">{workspace.name}</p>
              <p className="label">工作区</p>
            </div>
            <div css={{ textAlign: "right" }}>
              <p className="info">{workspaceBuildDateStr}</p>
              <p className="label">创建</p>
            </div>
          </div>

          <p>删除此工作区不可逆！</p>
          <p>
            输入 &ldquo;<strong>{workspace.name}</strong>&ldquo; 以确认:
          </p>

          <form onSubmit={onSubmit}>
            <TextField
              fullWidth
              autoFocus
              css={{ marginTop: 32 }}
              name="confirmation"
              autoComplete="off"
              id={`${hookId}-confirm`}
              placeholder={workspace.name}
              value={userConfirmationText}
              onChange={(event) => setUserConfirmationText(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              label="工作区名称"
              color={inputColor}
              error={displayErrorMessage}
              helperText={
                displayErrorMessage &&
                `${userConfirmationText} 与此工作区的名称不匹配。`
              }
              InputProps={{ color: inputColor }}
              inputProps={{
                "data-testid": "delete-dialog-name-confirmation",
              }}
            />
            {
              // Orphaning is sort of a "last resort" that should really only
              // be used if Terraform is failing to apply while deleting, which
              // usually means that builds are failing as well.
              canUpdateTemplate &&
                workspace.latest_build.status === "failed" && (
                  <div css={styles.orphanContainer}>
                    <div css={{ flexDirection: "column" }}>
                      <Checkbox
                        id="orphan_resources"
                        size="small"
                        color="warning"
                        onChange={() => {
                          setOrphanWorkspace(!orphanWorkspace);
                        }}
                        className="option"
                        name="orphan_resources"
                        checked={orphanWorkspace}
                        data-testid="orphan-checkbox"
                      />
                    </div>
                    <div css={{ flexDirection: "column" }}>
                      <p className="info">孤立资源</p>
                      <span
                        css={{ fontSize: 12, marginTop: 4, display: "block" }}
                      >
                        作为模板管理员，您可以跳过资源清理以删除失败的工作区。诸如卷和虚拟机之类的资源将不会被销毁。&nbsp;
                        <Link
                          href={docs("/workspaces#workspace-resources")}
                          target="_blank"
                          rel="noreferrer"
                        >
                          了解更多...
                        </Link>
                      </span>
                    </div>
                  </div>
                )
            }
          </form>
        </>
      }
    />
  );
};

const styles = {
  workspaceInfo: (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
    lineHeight: "1.3em",
    border: `1px solid ${theme.palette.divider}`,

    "& .name": {
      fontSize: 16,
      fontWeight: 600,
      color: theme.palette.text.primary,
    },

    "& .label": {
      fontSize: 12,
      color: theme.palette.text.secondary,
    },

    "& .info": {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.text.primary,
    },
  }),
  orphanContainer: (theme) => ({
    marginTop: 24,
    display: "flex",
    backgroundColor: theme.roles.danger.background,
    justifyContent: "space-between",
    border: `1px solid ${theme.roles.danger.outline}`,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    lineHeight: "18px",

    "& .option": {
      color: theme.roles.danger.fill.solid,
      "&.Mui-checked": {
        color: theme.roles.danger.fill.solid,
      },
    },

    "& .info": {
      fontSize: 14,
      fontWeight: 600,
      color: theme.roles.danger.text,
    },
  }),
} satisfies Record<string, Interpolation<Theme>>;
