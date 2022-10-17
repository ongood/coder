import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import TableCell from "@material-ui/core/TableCell"
import TableRow from "@material-ui/core/TableRow"
import AddCircleOutline from "@material-ui/icons/AddCircleOutline"
import { FC } from "react"
import { Link as RouterLink } from "react-router-dom"
import { workspaceFilterQuery } from "../../util/filters"
import { WorkspaceItemMachineRef } from "../../xServices/workspaces/workspacesXService"
import { EmptyState } from "../EmptyState/EmptyState"
import { TableLoader } from "../TableLoader/TableLoader"
import { WorkspacesRow } from "./WorkspacesRow"

export const Language = {
  emptyCreateWorkspaceMessage: "创建您的首个工作空间",
  emptyCreateWorkspaceDescription:
    "开始编辑您的源代码并构建您的软件。",
  createFromTemplateButton: "从模板创建",
  emptyResultsMessage: "没有与您的搜索匹配的结果",
}

interface TableBodyProps {
  isLoading?: boolean
  workspaceRefs?: WorkspaceItemMachineRef[]
  filter?: string
}

export const WorkspacesTableBody: FC<
  React.PropsWithChildren<TableBodyProps>
> = ({ isLoading, workspaceRefs, filter }) => {
  if (isLoading) {
    return <TableLoader />
  }

  if (!workspaceRefs || workspaceRefs.length === 0) {
    return (
      <>
        {filter === workspaceFilterQuery.me ||
        filter === workspaceFilterQuery.all ? (
          <TableRow>
            <TableCell colSpan={999}>
              <EmptyState
                message={Language.emptyCreateWorkspaceMessage}
                description={Language.emptyCreateWorkspaceDescription}
                cta={
                  <Link underline="none" component={RouterLink} to="/templates">
                    <Button startIcon={<AddCircleOutline />}>
                      {Language.createFromTemplateButton}
                    </Button>
                  </Link>
                }
              />
            </TableCell>
          </TableRow>
        ) : (
          <TableRow>
            <TableCell colSpan={999}>
              <EmptyState message={Language.emptyResultsMessage} />
            </TableCell>
          </TableRow>
        )}
      </>
    )
  }

  return (
    <>
      {workspaceRefs.map((workspaceRef) => (
        <WorkspacesRow workspaceRef={workspaceRef} key={workspaceRef.id} />
      ))}
    </>
  )
}
