import { Stats, StatsItem } from "components/Stats/Stats"
import { FC } from "react"
import { Link } from "react-router-dom"
import { createDayString } from "util/createDayString"
import {
  formatTemplateBuildTime,
  formatTemplateActiveDevelopers,
} from "util/templates"
import { Template, TemplateVersion } from "../../api/typesGenerated"

const Language = {
  usedByLabel: "用户",
  buildTimeLabel: "创建时间",
  activeVersionLabel: "当前版本",
  lastUpdateLabel: "最近更新",
  developerPlural: "开发者",
  developerSingular: "开发者",
  createdByLabel: "创建者",
}

export interface TemplateStatsProps {
  template: Template
  activeVersion: TemplateVersion
}

export const TemplateStats: FC<TemplateStatsProps> = ({
  template,
  activeVersion,
}) => {
  return (
    <Stats>
      <StatsItem
        label={Language.usedByLabel}
        value={
          <>
            {formatTemplateActiveDevelopers(template.active_user_count)}{" "}
            {template.active_user_count === 1
              ? Language.developerSingular
              : Language.developerPlural}
          </>
        }
      />
      <StatsItem
        label={Language.buildTimeLabel}
        value={formatTemplateBuildTime(template.build_time_stats.start.P50)}
      />
      <StatsItem
        label={Language.activeVersionLabel}
        value={
          <Link to={`versions/${activeVersion.name}`}>
            {activeVersion.name}
          </Link>
        }
      />
      <StatsItem
        label={Language.lastUpdateLabel}
        value={createDayString(template.updated_at)}
      />
      <StatsItem
        label={Language.createdByLabel}
        value={template.created_by_name}
      />
    </Stats>
  )
}
