import Box from "@material-ui/core/Box"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableRow from "@material-ui/core/TableRow"
import { FC, Fragment } from "react"
import * as TypesGen from "../../api/typesGenerated"
import { EmptyState } from "../EmptyState/EmptyState"
import { TableLoader } from "../TableLoader/TableLoader"
import { BuildDateRow } from "./BuildDateRow"
import { BuildRow } from "./BuildRow"

export const Language = {
  emptyMessage: "未找到任何构建",
  inProgressLabel: "进行中",
  actionLabel: "动作",
  durationLabel: "耗时",
  startedAtLabel: "始于",
  statusLabel: "状态",
}

export interface BuildsTableProps {
  builds?: TypesGen.WorkspaceBuild[]
}

const groupBuildsByDate = (builds?: TypesGen.WorkspaceBuild[]) => {
  const buildsByDate: Record<string, TypesGen.WorkspaceBuild[]> = {}

  if (!builds) {
    return
  }

  builds.forEach((build) => {
    const dateKey = new Date(build.created_at).toDateString()

    // Unsure why this is here but we probably need to fix it.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- see above
    if (buildsByDate[dateKey]) {
      buildsByDate[dateKey].push(build)
    } else {
      buildsByDate[dateKey] = [build]
    }
  })

  return buildsByDate
}

export const BuildsTable: FC<React.PropsWithChildren<BuildsTableProps>> = ({
  builds,
}) => {
  const isLoading = !builds
  const buildsByDate = groupBuildsByDate(builds)

  return (
    <TableContainer>
      <Table data-testid="builds-table" aria-describedby="builds table">
        <TableBody>
          {isLoading && <TableLoader />}

          {buildsByDate &&
            Object.keys(buildsByDate).map((dateStr) => {
              const builds = buildsByDate[dateStr]

              return (
                <Fragment key={dateStr}>
                  <BuildDateRow date={new Date(dateStr)} />
                  {builds.map((build) => (
                    <BuildRow key={build.id} build={build} />
                  ))}
                </Fragment>
              )
            })}

          {builds && builds.length === 0 && (
            <TableRow>
              <TableCell colSpan={999}>
                <Box p={4}>
                  <EmptyState message={Language.emptyMessage} />
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
