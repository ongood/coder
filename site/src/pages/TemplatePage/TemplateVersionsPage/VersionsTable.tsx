import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { Timeline } from "components/Timeline/Timeline";
import { type FC } from "react";
import * as TypesGen from "api/typesGenerated";
import { EmptyState } from "components/EmptyState/EmptyState";
import { TableLoader } from "components/TableLoader/TableLoader";
import { VersionRow } from "./VersionRow";

export const Language = {
  emptyMessage: "未找到任何版本",
  nameLabel: "版本名",
  createdAtLabel: "创建于",
  createdByLabel: "创建者",
}

export interface VersionsTableProps {
  activeVersionId: string;
  onPromoteClick?: (templateVersionId: string) => void;
  onArchiveClick?: (templateVersionId: string) => void;

  versions?: TypesGen.TemplateVersion[];
}

export const VersionsTable: FC<VersionsTableProps> = (props) => {
  const { versions, onArchiveClick, onPromoteClick, activeVersionId } = props;

  const latestVersionId = versions?.reduce(
    (latestSoFar, against) => {
      if (against.job.status !== "succeeded") {
        return latestSoFar;
      }

      if (!latestSoFar) {
        return against;
      }

      return new Date(against.updated_at).getTime() >
        new Date(latestSoFar.updated_at).getTime()
        ? against
        : latestSoFar;
    },
    undefined as TypesGen.TemplateVersion | undefined,
  )?.id;

  return (
    <TableContainer>
      <Table data-testid="versions-table">
        <TableBody>
          {versions ? (
            <Timeline
              items={[...versions].reverse()}
              getDate={(version) => new Date(version.created_at)}
              row={(version) => (
                <VersionRow
                  onArchiveClick={onArchiveClick}
                  onPromoteClick={onPromoteClick}
                  version={version}
                  key={version.id}
                  isActive={activeVersionId === version.id}
                  isLatest={latestVersionId === version.id}
                />
              )}
            />
          ) : (
            <TableLoader />
          )}

          {versions && versions.length === 0 && (
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
  );
};
