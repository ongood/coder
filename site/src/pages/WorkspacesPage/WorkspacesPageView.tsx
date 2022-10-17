import Link from "@material-ui/core/Link"
import { FC } from "react"
import { Link as RouterLink } from "react-router-dom"
import { Margins } from "../../components/Margins/Margins"
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderTitle,
} from "../../components/PageHeader/PageHeader"
import { SearchBarWithFilter } from "../../components/SearchBarWithFilter/SearchBarWithFilter"
import { Stack } from "../../components/Stack/Stack"
import { WorkspaceHelpTooltip } from "../../components/Tooltips"
import { WorkspacesTable } from "../../components/WorkspacesTable/WorkspacesTable"
import { workspaceFilterQuery } from "../../util/filters"
import { WorkspaceItemMachineRef } from "../../xServices/workspaces/workspacesXService"

export const Language = {
  pageTitle: "工作空间",
  yourWorkspacesButton: "你的工作空间",
  allWorkspacesButton: "所有工作空间",
  runningWorkspacesButton: "运行中的工作空间",
  createANewWorkspace: `创建新工作空间基于`,
  template: "模板",
}

export interface WorkspacesPageViewProps {
  isLoading?: boolean
  workspaceRefs?: WorkspaceItemMachineRef[]
  filter?: string
  onFilter: (query: string) => void
}

export const WorkspacesPageView: FC<
  React.PropsWithChildren<WorkspacesPageViewProps>
> = ({ isLoading, workspaceRefs, filter, onFilter }) => {
  const presetFilters = [
    { query: workspaceFilterQuery.me, name: Language.yourWorkspacesButton },
    { query: workspaceFilterQuery.all, name: Language.allWorkspacesButton },
    {
      query: workspaceFilterQuery.running,
      name: Language.runningWorkspacesButton,
    },
  ]

  return (
    <Margins>
      <PageHeader>
        <PageHeaderTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <span>{Language.pageTitle}</span>
            <WorkspaceHelpTooltip />
          </Stack>
        </PageHeaderTitle>

        <PageHeaderSubtitle>
          {Language.createANewWorkspace}
          <Link component={RouterLink} to="/templates">
            {Language.template}
          </Link>
          .
        </PageHeaderSubtitle>
      </PageHeader>

      <SearchBarWithFilter
        filter={filter}
        onFilter={onFilter}
        presetFilters={presetFilters}
      />

      <WorkspacesTable
        isLoading={isLoading}
        workspaceRefs={workspaceRefs}
        filter={filter}
      />
    </Margins>
  )
}
