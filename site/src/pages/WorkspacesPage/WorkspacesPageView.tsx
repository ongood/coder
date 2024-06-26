import CloudQueue from "@mui/icons-material/CloudQueue";
import DeleteOutlined from "@mui/icons-material/DeleteOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import StopOutlined from "@mui/icons-material/StopOutlined";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import type { ComponentProps } from "react";
import type { UseQueryResult } from "react-query";
import { hasError, isApiValidationError } from "api/errors";
import type { Template, Workspace } from "api/typesGenerated";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { EmptyState } from "components/EmptyState/EmptyState";
import { Margins } from "components/Margins/Margins";
import {
  MoreMenu,
  MoreMenuContent,
  MoreMenuItem,
  MoreMenuTrigger,
} from "components/MoreMenu/MoreMenu";
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader";
import { PaginationHeader } from "components/PaginationWidget/PaginationHeader";
import { PaginationWidgetBase } from "components/PaginationWidget/PaginationWidgetBase";
import { Stack } from "components/Stack/Stack";
import { TableToolbar } from "components/TableToolbar/TableToolbar";
import { WorkspacesTable } from "pages/WorkspacesPage/WorkspacesTable";
import { mustUpdateWorkspace } from "utils/workspace";
import { WorkspacesFilter } from "./filter/filter";
import { WorkspaceHelpTooltip } from "./WorkspaceHelpTooltip";
import { WorkspacesButton } from "./WorkspacesButton";

export const Language = {
  pageTitle: "工作区",
  yourWorkspacesButton: "你的工作区",
  allWorkspacesButton: "所有工作区",
  runningWorkspacesButton: "运行中的工作区",
  createWorkspace: <>创建工作区&hellip;</>,
  seeAllTemplates: "查看所有模板",
  template: "模板",
};

type TemplateQuery = UseQueryResult<Template[]>;

export interface WorkspacesPageViewProps {
  error: unknown;
  workspaces?: readonly Workspace[];
  checkedWorkspaces: readonly Workspace[];
  count?: number;
  filterProps: ComponentProps<typeof WorkspacesFilter>;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onCheckChange: (checkedWorkspaces: readonly Workspace[]) => void;
  isRunningBatchAction: boolean;
  onDeleteAll: () => void;
  onUpdateAll: () => void;
  onStartAll: () => void;
  onStopAll: () => void;
  canCheckWorkspaces: boolean;
  templatesFetchStatus: TemplateQuery["status"];
  templates: TemplateQuery["data"];
  canCreateTemplate: boolean;
  canChangeVersions: boolean;
}

export const WorkspacesPageView = ({
  workspaces,
  error,
  limit,
  count,
  filterProps,
  onPageChange,
  onUpdateWorkspace,
  page,
  checkedWorkspaces,
  onCheckChange,
  onDeleteAll,
  onUpdateAll,
  onStopAll,
  onStartAll,
  isRunningBatchAction,
  canCheckWorkspaces,
  templates,
  templatesFetchStatus,
  canCreateTemplate,
  canChangeVersions,
}: WorkspacesPageViewProps) => {
  // Let's say the user has 5 workspaces, but tried to hit page 100, which does
  // not exist. In this case, the page is not valid and we want to show a better
  // error message.
  const invalidPageNumber = page !== 1 && workspaces?.length === 0;

  return (
    <Margins>
      <PageHeader
        actions={
          <WorkspacesButton
            templates={templates}
            templatesFetchStatus={templatesFetchStatus}
          >
            {Language.createWorkspace}
          </WorkspacesButton>
        }
      >
        <PageHeaderTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <span>{Language.pageTitle}</span>
            <WorkspaceHelpTooltip />
          </Stack>
        </PageHeaderTitle>
      </PageHeader>

      <Stack>
        {hasError(error) && !isApiValidationError(error) && (
          <ErrorAlert error={error} />
        )}
        <WorkspacesFilter error={error} {...filterProps} />
      </Stack>

      <TableToolbar>
        {checkedWorkspaces.length > 0 ? (
          <>
            <div>
              已选中 <strong>{checkedWorkspaces.length}</strong> of{" "}
              <strong>{workspaces?.length}</strong>{" "}
              {workspaces?.length === 1 ? "workspace" : "workspaces"}
            </div>

            <MoreMenu>
              <MoreMenuTrigger>
                <LoadingButton
                  loading={isRunningBatchAction}
                  loadingPosition="end"
                  variant="text"
                  size="small"
                  css={{ borderRadius: 9999, marginLeft: "auto" }}
                  endIcon={<KeyboardArrowDownOutlined />}
                >
                  动作
                </LoadingButton>
              </MoreMenuTrigger>
              <MoreMenuContent>
                <MoreMenuItem
                  onClick={onStartAll}
                  disabled={
                    !checkedWorkspaces?.every(
                      (w) =>
                        w.latest_build.status === "stopped" &&
                        !mustUpdateWorkspace(w, canChangeVersions),
                    )
                  }
                >
                  <PlayArrowOutlined /> 开始
                </MoreMenuItem>
                <MoreMenuItem
                  onClick={onStopAll}
                  disabled={
                    !checkedWorkspaces?.every(
                      (w) => w.latest_build.status === "running",
                    )
                  }
                >
                  <StopOutlined /> 停止
                </MoreMenuItem>
                <Divider />
                <MoreMenuItem onClick={onUpdateAll}>
                  <CloudQueue /> 升级&hellip;
                </MoreMenuItem>
                <MoreMenuItem danger onClick={onDeleteAll}>
                  <DeleteOutlined /> 删除&hellip;
                </MoreMenuItem>
              </MoreMenuContent>
            </MoreMenu>
          </>
        ) : (
          !invalidPageNumber && (
            <PaginationHeader
              paginationUnitLabel="工作区"
              limit={limit}
              totalRecords={count}
              currentOffsetStart={(page - 1) * limit + 1}
              css={{ paddingBottom: "0" }}
            />
          )
        )}
      </TableToolbar>

      {invalidPageNumber ? (
        <EmptyState
          css={(theme) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          })}
          message="Page not found"
          description="The page you are trying to access does not exist."
          cta={
            <Button
              onClick={() => {
                onPageChange(1);
              }}
            >
              Back to the first page
            </Button>
          }
        />
      ) : (
        <WorkspacesTable
          canCreateTemplate={canCreateTemplate}
          workspaces={workspaces}
          isUsingFilter={filterProps.filter.used}
          onUpdateWorkspace={onUpdateWorkspace}
          checkedWorkspaces={checkedWorkspaces}
          onCheckChange={onCheckChange}
          canCheckWorkspaces={canCheckWorkspaces}
          templates={templates}
        />
      )}

      {count !== undefined && (
        // Temporary styling stopgap before component is migrated to using
        // PaginationContainer (which renders PaginationWidgetBase using CSS
        // flexbox gaps)
        <div css={{ paddingTop: "16px" }}>
          <PaginationWidgetBase
            totalRecords={count}
            pageSize={limit}
            onPageChange={onPageChange}
            currentPage={page}
          />
        </div>
      )}
    </Margins>
  );
};
