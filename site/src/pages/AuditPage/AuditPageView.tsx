import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableRow from "@material-ui/core/TableRow"
import { AuditLog } from "api/typesGenerated"
import { AuditLogRow } from "components/AuditLogRow/AuditLogRow"
import { EmptyState } from "components/EmptyState/EmptyState"
import { Margins } from "components/Margins/Margins"
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderTitle,
} from "components/PageHeader/PageHeader"
import { PaginationWidget } from "components/PaginationWidget/PaginationWidget"
import { SearchBarWithFilter } from "components/SearchBarWithFilter/SearchBarWithFilter"
import { Stack } from "components/Stack/Stack"
import { TableDateRow } from "components/TableDateRow/TableDateRow"
import { TableLoader } from "components/TableLoader/TableLoader"
import { AuditHelpTooltip } from "components/Tooltips"
import { FC, Fragment } from "react"
import { PaginationMachineRef } from "xServices/pagination/paginationXService"

export const Language = {
  title: "审计",
  subtitle: "查看审计日志中的事件。",
}

const presetFilters = [
  {
    query: "resource_type:workspace action:create",
    name: "已创建的工作空间",
  },
  { query: "resource_type:template action:create", name: "已添加的模板" },
  { query: "resource_type:user action:create", name: "已添加的用户" },
  { query: "resource_type:template action:delete", name: "已删除的模板" },
  { query: "resource_type:user action:delete", name: "已删除的用户" },
]

const groupAuditLogsByDate = (auditLogs?: AuditLog[]) => {
  const auditLogsByDate: Record<string, AuditLog[]> = {}

  if (!auditLogs) {
    return
  }

  auditLogs.forEach((auditLog) => {
    const dateKey = new Date(auditLog.time).toDateString()

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (auditLogsByDate[dateKey]) {
      auditLogsByDate[dateKey].push(auditLog)
    } else {
      auditLogsByDate[dateKey] = [auditLog]
    }
  })

  return auditLogsByDate
}

export interface AuditPageViewProps {
  auditLogs?: AuditLog[]
  count?: number
  filter: string
  onFilter: (filter: string) => void
  paginationRef: PaginationMachineRef
}

export const AuditPageView: FC<AuditPageViewProps> = ({
  auditLogs,
  count,
  filter,
  onFilter,
  paginationRef,
}) => {
  const isLoading = auditLogs === undefined || count === undefined
  const isEmpty = !isLoading && auditLogs.length === 0
  const auditLogsByDate = groupAuditLogsByDate(auditLogs)

  return (
    <Margins>
      <PageHeader>
        <PageHeaderTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <span>{Language.title}</span>
            <AuditHelpTooltip />
          </Stack>
        </PageHeaderTitle>
        <PageHeaderSubtitle>{Language.subtitle}</PageHeaderSubtitle>
      </PageHeader>

      <SearchBarWithFilter
        docs="https://coder.com/docs/coder-oss/latest/admin/audit-logs#filtering-logs"
        filter={filter}
        onFilter={onFilter}
        presetFilters={presetFilters}
      />

      <TableContainer>
        <Table>
          <TableBody>
            {isLoading && <TableLoader />}

            {auditLogsByDate &&
              Object.keys(auditLogsByDate).map((dateStr) => {
                const auditLogs = auditLogsByDate[dateStr]

                return (
                  <Fragment key={dateStr}>
                    <TableDateRow date={new Date(dateStr)} />
                    {auditLogs.map((log) => (
                      <AuditLogRow key={log.id} auditLog={log} />
                    ))}
                  </Fragment>
                )
              })}

            {isEmpty && (
              <TableRow>
                <TableCell colSpan={999}>
                  <EmptyState message="没有可用的审计日志" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationWidget numRecords={count} paginationRef={paginationRef} />
    </Margins>
  )
}
