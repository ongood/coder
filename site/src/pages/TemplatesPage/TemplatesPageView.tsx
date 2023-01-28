import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import AddIcon from "@material-ui/icons/AddOutlined"
import { AlertBanner } from "components/AlertBanner/AlertBanner"
import { ChooseOne, Cond } from "components/Conditionals/ChooseOne"
import { Maybe } from "components/Conditionals/Maybe"
import { FC } from "react"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { createDayString } from "util/createDayString"
import {
  formatTemplateBuildTime,
  formatTemplateActiveDevelopers,
} from "util/templates"
import { AvatarData } from "../../components/AvatarData/AvatarData"
import { Margins } from "../../components/Margins/Margins"
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderTitle,
} from "../../components/PageHeader/PageHeader"
import { Stack } from "../../components/Stack/Stack"
import { TableLoader } from "../../components/TableLoader/TableLoader"
import {
  HelpTooltip,
  HelpTooltipLink,
  HelpTooltipLinksGroup,
  HelpTooltipText,
  HelpTooltipTitle,
} from "../../components/Tooltips/HelpTooltip/HelpTooltip"
import { EmptyTemplates } from "./EmptyTemplates"
import { TemplatesContext } from "xServices/templates/templatesXService"
import { useClickableTableRow } from "hooks/useClickableTableRow"
import { Template } from "api/typesGenerated"
import { combineClasses } from "util/combineClasses"
import { colors } from "theme/colors"
import ArrowForwardOutlined from "@material-ui/icons/ArrowForwardOutlined"
import { Avatar } from "components/Avatar/Avatar"

export const Language = {
  developerCount: (activeCount: number): string => {
    return `${formatTemplateActiveDevelopers(activeCount)} 开发者`
  },
  nameLabel: "名称",
  buildTimeLabel: "创建时间",
  usedByLabel: "使用者",
  lastUpdatedLabel: "最近更新",
  templateTooltipTitle: "什么是模板?",
  templateTooltipText:
    "您可以使用 Terraform 为您的工作空间创建通用配置模板。",
  templateTooltipLink: "管理模板",
}

const TemplateHelpTooltip: React.FC = () => {
  return (
    <HelpTooltip>
      <HelpTooltipTitle>{Language.templateTooltipTitle}</HelpTooltipTitle>
      <HelpTooltipText>{Language.templateTooltipText}</HelpTooltipText>
      <HelpTooltipLinksGroup>
        <HelpTooltipLink href="https://coder.com/docs/coder-oss/latest/templates#manage-templates">
          {Language.templateTooltipLink}
        </HelpTooltipLink>
      </HelpTooltipLinksGroup>
    </HelpTooltip>
  )
}

const TemplateRow: FC<{ template: Template }> = ({ template }) => {
  const templatePageLink = `/templates/${template.name}`
  const hasIcon = template.icon && template.icon !== ""
  const navigate = useNavigate()
  const styles = useStyles()
  const { className: clickableClassName, ...clickableRow } =
    useClickableTableRow(() => {
      navigate(templatePageLink)
    })

  return (
    <TableRow
      key={template.id}
      data-testid={`template-${template.id}`}
      {...clickableRow}
      className={combineClasses([clickableClassName, styles.tableRow])}
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

      <TableCell className={styles.secondary}>
        {Language.developerCount(template.active_user_count)}
      </TableCell>

      <TableCell className={styles.secondary}>
        {formatTemplateBuildTime(template.build_time_stats.start.P50)}
      </TableCell>

      <TableCell data-chromatic="ignore" className={styles.secondary}>
        {createDayString(template.updated_at)}
      </TableCell>

      <TableCell className={styles.actionCell}>
        <Button
          variant="outlined"
          size="small"
          className={styles.actionButton}
          startIcon={<ArrowForwardOutlined />}
          title={`Create a workspace using the ${template.display_name} template`}
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/templates/${template.name}/workspace`)
          }}
        >
          使用模板
        </Button>
      </TableCell>
    </TableRow>
  )
}

export interface TemplatesPageViewProps {
  context: TemplatesContext
}

export const TemplatesPageView: FC<
  React.PropsWithChildren<TemplatesPageViewProps>
> = ({ context }) => {
  const { templates, error, examples, permissions } = context
  const isLoading = !templates
  const isEmpty = Boolean(templates && templates.length === 0)

  return (
    <Margins>
      <PageHeader
        actions={
          <Maybe condition={permissions.createTemplates}>
            <Button component={RouterLink} to="/starter-templates">
              入门模板
            </Button>
            <Button startIcon={<AddIcon />} component={RouterLink} to="new">
              添加模板
            </Button>
          </Maybe>
        }
      >
        <PageHeaderTitle>
          <Stack spacing={1} direction="row" alignItems="center">
            模板
            <TemplateHelpTooltip />
          </Stack>
        </PageHeaderTitle>
        <Maybe condition={Boolean(templates && templates.length > 0)}>
          <PageHeaderSubtitle>
            选择一个模板以创建新的工作区
            {permissions.createTemplates ? (
              <>
                , 或基于CLI
                <Link
                  href="https://coder.com/docs/coder-oss/latest/templates#add-a-template"
                  target="_blank"
                >
                  管理模板
                </Link>
                .
              </>
            ) : (
              "."
            )}
          </PageHeaderSubtitle>
        </Maybe>
      </PageHeader>

      <ChooseOne>
        <Cond condition={Boolean(error)}>
          <AlertBanner severity="error" error={error} />
        </Cond>

        <Cond>
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
                <Maybe condition={isLoading}>
                  <TableLoader />
                </Maybe>

                <ChooseOne>
                  <Cond condition={isEmpty}>
                    <EmptyTemplates
                      permissions={permissions}
                      examples={examples ?? []}
                    />
                  </Cond>

                  <Cond>
                    {templates?.map((template) => (
                      <TemplateRow key={template.id} template={template} />
                    ))}
                  </Cond>
                </ChooseOne>
              </TableBody>
            </Table>
          </TableContainer>
        </Cond>
      </ChooseOne>
    </Margins>
  )
}

const useStyles = makeStyles((theme) => ({
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
  secondary: {
    color: theme.palette.text.secondary,
  },
  tableRow: {
    "&:hover $actionButton": {
      color: theme.palette.text.primary,
      borderColor: colors.gray[11],
      "&:hover": {
        borderColor: theme.palette.text.primary,
      },
    },
  },
  actionButton: {
    color: theme.palette.text.secondary,
    transition: "none",
  },
}))
