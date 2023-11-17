import { type Interpolation, type Theme } from "@emotion/react";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import AddIcon from "@mui/icons-material/AddOutlined";
import { type FC } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { createDayString } from "utils/createDayString";
import {
  formatTemplateBuildTime,
  formatTemplateActiveDevelopers,
} from "utils/templates";
import { AvatarData } from "components/AvatarData/AvatarData";
import { Margins } from "components/Margins/Margins";
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderTitle,
} from "components/PageHeader/PageHeader";
import { Stack } from "components/Stack/Stack";
import {
  TableLoaderSkeleton,
  TableRowSkeleton,
} from "components/TableLoader/TableLoader";
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "components/HelpTooltip/HelpTooltip";
import { EmptyTemplates } from "./EmptyTemplates";
import { useClickableTableRow } from "hooks/useClickableTableRow";
import type { Template, TemplateExample } from "api/typesGenerated";
import { colors } from "theme/colors";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { Avatar } from "components/Avatar/Avatar";
import { ErrorAlert } from "components/Alert/ErrorAlert";
import { docs } from "utils/docs";
import Skeleton from "@mui/material/Skeleton";
import { Box } from "@mui/system";
import { AvatarDataSkeleton } from "components/AvatarData/AvatarDataSkeleton";

export const Language = {
  developerCount: (activeCount: number): string => {
    return `${formatTemplateActiveDevelopers(activeCount)} 开发者${
      activeCount !== 1 ? "s" : ""
    }`;
  },
  nameLabel: "名称",
  buildTimeLabel: "创建时间",
  usedByLabel: "使用者",
  lastUpdatedLabel: "最近更新",
  templateTooltipTitle: "什么是模板?",
  templateTooltipText:
    "With templates you can create a common configuration for your workspaces using Terraform.",
  templateTooltipLink: "Manage templates",
};

const TemplateHelpTooltip: React.FC = () => {
  return (
    <HelpTooltip>
      <HelpTooltipTitle>{Language.templateTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.templateTooltipText}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href={docs("/templates")}>
          {Language.templateTooltipLink}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  );
};

const TemplateRow: FC<{ template: Template }> = ({ template }) => {
  const templatePageLink = `/templates/${template.name}`;
  const hasIcon = template.icon && template.icon !== "";
  const navigate = useNavigate();

  const { css: clickableCss, ...clickableRow } = useClickableTableRow({
    onClick: () => navigate(templatePageLink),
  });

  return (
    <TableRow
      key={template.id}
      data-testid={`template-${template.id}`}
      {...clickableRow}
      css={[clickableCss, styles.tableRow]}
    >
      <TableCell>
        <AvatarData
          title={
            template.display_name.length > 0
              ? template.display_name
              : template.name
          }
          subtitle={template.description}
          avatar={
            hasIcon && <Avatar src={template.icon} variant="square" fitImage />
          }
        />
      </TableCell>

      <TableCell css={styles.secondary}>
        {Language.developerCount(template.active_user_count)}
      </TableCell>

      <TableCell css={styles.secondary}>
        {formatTemplateBuildTime(template.build_time_stats.start.P50)}
      </TableCell>

      <TableCell data-chromatic="ignore" css={styles.secondary}>
        {createDayString(template.updated_at)}
      </TableCell>

      <TableCell css={styles.actionCell}>
        <Button
          size="small"
          css={styles.actionButton}
          className="actionButton"
          startIcon={<ArrowForwardOutlined />}
          title={`Create a workspace using the ${template.display_name} template`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/templates/${template.name}/workspace`);
          }}
        >
          创建工作区
        </Button>
      </TableCell>
    </TableRow>
  );
};

export interface TemplatesPageViewProps {
  error?: unknown;
  examples: TemplateExample[] | undefined;
  templates: Template[] | undefined;
  canCreateTemplates: boolean;
}

export const TemplatesPageView: FC<TemplatesPageViewProps> = ({
  templates,
  error,
  examples,
  canCreateTemplates,
}) => {
  const isLoading = !templates;
  const isEmpty = templates && templates.length === 0;

  return (
    <Margins>
      <PageHeader
        actions={
          canCreateTemplates && (
            <>
              <Button component={RouterLink} to="/starter-templates">
                入门模板
              </Button>
              <Button
                startIcon={<AddIcon />}
                component={RouterLink}
                to="new"
                variant="contained"
              >
                创建模板
              </Button>
            </>
          )
        }
      >
        <PageHeaderTitle>
          <Stack spacing={1} direction="row" alignItems="center">
            模板
            <TemplateHelpTooltip />
          </Stack>
        </PageHeaderTitle>
        {templates && templates.length > 0 && (
          <PageHeaderSubtitle>
            选择一个模板来创建工作区。
          </PageHeaderSubtitle>
        )}
      </PageHeader>

      {error ? (
        <ErrorAlert error={error} />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="35%">{Language.nameLabel}</TableCell>
                <TableCell width="15%">{Language.usedByLabel}</TableCell>
                <TableCell width="10%">{Language.buildTimeLabel}</TableCell>
                <TableCell width="15%">{Language.lastUpdatedLabel}</TableCell>
                <TableCell width="1%"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && <TableLoader />}

              {isEmpty ? (
                <EmptyTemplates
                  canCreateTemplates={canCreateTemplates}
                  examples={examples ?? []}
                />
              ) : (
                templates?.map((template) => (
                  <TemplateRow key={template.id} template={template} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Margins>
  );
};

const TableLoader = () => {
  return (
    <TableLoaderSkeleton>
      <TableRowSkeleton>
        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AvatarDataSkeleton />
          </Box>
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="25%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="25%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="25%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="25%" />
        </TableCell>
      </TableRowSkeleton>
    </TableLoaderSkeleton>
  );
};

const styles = {
  templateIconWrapper: {
    // Same size then the avatar component
    width: 36,
    height: 36,
    padding: 2,

    "& img": {
      width: "100%",
    },
  },
  actionCell: {
    whiteSpace: "nowrap",
  },
  secondary: (theme) => ({
    color: theme.palette.text.secondary,
  }),
  tableRow: (theme) => ({
    "&:hover .actionButton": {
      color: theme.palette.text.primary,
      borderColor: colors.gray[11],
      "&:hover": {
        borderColor: theme.palette.text.primary,
      },
    },
  }),
  actionButton: (theme) => ({
    color: theme.palette.text.secondary,
    transition: "none",
  }),
} satisfies Record<string, Interpolation<Theme>>;
