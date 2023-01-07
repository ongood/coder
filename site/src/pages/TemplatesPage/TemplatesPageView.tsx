import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import { makeStyles, Theme } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"
import AddIcon from "@material-ui/icons/AddOutlined"
import useTheme from "@material-ui/styles/useTheme"
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
import { TableCellLink } from "../../components/TableCellLink/TableCellLink"
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

export const Language = {
  developerCount: (activeCount: number): string => {
    return `${formatTemplateActiveDevelopers(activeCount)} 开发者`
  },
  nameLabel: "名称",
  buildTimeLabel: "创建时间",
  usedByLabel: "使用者",
  lastUpdatedLabel: "最近更新",
  templateTooltipTitle: "What is template?",
  templateTooltipText:
    "您可以使用 Terraform 为您的工作空间创建通用配置模板。",
  templateTooltipLink: "管理模板",
  createdByLabel: "创建者",
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

export interface TemplatesPageViewProps {
  context: TemplatesContext
}

export const TemplatesPageView: FC<
  React.PropsWithChildren<TemplatesPageViewProps>
> = ({ context }) => {
  const styles = useStyles()
  const navigate = useNavigate()
  const theme: Theme = useTheme()
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
                  <TableCell width="34%">{Language.nameLabel}</TableCell>
                  <TableCell width="16%">{Language.usedByLabel}</TableCell>
                  <TableCell width="16%">{Language.buildTimeLabel}</TableCell>
                  <TableCell width="16%">{Language.lastUpdatedLabel}</TableCell>
                  <TableCell width="16%">{Language.createdByLabel}</TableCell>
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
                    {templates?.map((template) => {
                      const templatePageLink = `/templates/${template.name}`
                      const hasIcon = template.icon && template.icon !== ""

                      return (
                        <TableRow
                          key={template.id}
                          hover
                          data-testid={`template-${template.id}`}
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              navigate(templatePageLink)
                            }
                          }}
                          className={styles.clickableTableRow}
                        >
                          <TableCellLink to={templatePageLink}>
                            <AvatarData
                              title={
                                template.display_name.length > 0
                                  ? template.display_name
                                  : template.name
                              }
                              subtitle={template.description}
                              highlightTitle
                              avatar={
                                hasIcon && (
                                  <div className={styles.templateIconWrapper}>
                                    <img alt="" src={template.icon} />
                                  </div>
                                )
                              }
                            />
                          </TableCellLink>

                          <TableCellLink to={templatePageLink}>
                            <span
                              style={{ color: theme.palette.text.secondary }}
                            >
                              {Language.developerCount(
                                template.active_user_count,
                              )}
                            </span>
                          </TableCellLink>

                          <TableCellLink to={templatePageLink}>
                            <span
                              style={{ color: theme.palette.text.secondary }}
                            >
                              {formatTemplateBuildTime(
                                template.build_time_stats.start.P50,
                              )}
                            </span>
                          </TableCellLink>

                          <TableCellLink
                            data-chromatic="ignore"
                            to={templatePageLink}
                          >
                            <span
                              style={{ color: theme.palette.text.secondary }}
                            >
                              {createDayString(template.updated_at)}
                            </span>
                          </TableCellLink>

                          <TableCellLink to={templatePageLink}>
                            <span
                              style={{ color: theme.palette.text.secondary }}
                            >
                              {template.created_by_name}
                            </span>
                          </TableCellLink>

                          <TableCellLink to={templatePageLink}>
                            <div className={styles.arrowCell}>
                              <KeyboardArrowRight
                                className={styles.arrowRight}
                              />
                            </div>
                          </TableCellLink>
                        </TableRow>
                      )
                    })}
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
  clickableTableRow: {
    "&:hover td": {
      backgroundColor: theme.palette.action.hover,
    },

    "&:focus": {
      outline: `1px solid ${theme.palette.secondary.dark}`,
    },

    "& .MuiTableCell-root:last-child": {
      paddingRight: theme.spacing(2),
    },
  },
  arrowRight: {
    color: theme.palette.text.secondary,
    width: 20,
    height: 20,
  },
  arrowCell: {
    display: "flex",
  },
  templateIconWrapper: {
    // Same size then the avatar component
    width: 36,
    height: 36,
    padding: 2,

    "& img": {
      width: "100%",
    },
  },
}))
