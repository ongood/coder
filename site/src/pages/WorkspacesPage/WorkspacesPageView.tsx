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
  pageTitle: "工作区",
  yourWorkspacesButton: "你的工作区",
  allWorkspacesButton: "所有工作区",
  runningWorkspacesButton: "运行中的工作区",
  createANewWorkspace: `创建新工作区`,
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
          基于
          <Link component={RouterLink} to="/templates">
            {Language.template}
          </Link>
          {Language.createANewWorkspace}
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
