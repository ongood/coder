import type { ComponentProps, FC } from "react";
import type { Workspace } from "api/typesGenerated";
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader";
import { WorkspaceSettingsForm } from "./WorkspaceSettingsForm";

export type WorkspaceSettingsPageViewProps = {
  error: unknown;
  workspace: Workspace;
  onCancel: () => void;
  onSubmit: ComponentProps<typeof WorkspaceSettingsForm>["onSubmit"];
};

export const WorkspaceSettingsPageView: FC<WorkspaceSettingsPageViewProps> = ({
  onCancel,
  onSubmit,
  error,
  workspace,
}) => {
  return (
    <>
      <PageHeader
        css={{
          paddingTop: 0,
        }}
      >
        <PageHeaderTitle>工作区设置</PageHeaderTitle>
      </PageHeader>

      <WorkspaceSettingsForm
        error={error}
        workspace={workspace}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </>
  );
};
