import { type FC } from "react";
import type { ClibaseOption } from "api/typesGenerated";
import { deploymentGroupHasParent } from "utils/deployOptions";
import { docs } from "utils/docs";
import {
  Badges,
  DisabledBadge,
  EnabledBadge,
  EnterpriseBadge,
} from "components/Badges/Badges";
import { Stack } from "components/Stack/Stack";
import { Header } from "../Header";
import OptionsTable from "../OptionsTable";

export type ObservabilitySettingsPageViewProps = {
  options: ClibaseOption[];
  featureAuditLogEnabled: boolean;
};

export const ObservabilitySettingsPageView: FC<
  ObservabilitySettingsPageViewProps
> = ({ options: options, featureAuditLogEnabled }) => {
  return (
    <>
      <Stack direction="column" spacing={6}>
        <div>
          <Header title="可观察性" />
          <Header
            title="审计日志"
            secondary
            description="允许审计人员监视您部署中的用户操作。"
            docsHref={docs("/admin/audit-logs")}
          />

          <Badges>
            {featureAuditLogEnabled ? <EnabledBadge /> : <DisabledBadge />}
            <EnterpriseBadge />
          </Badges>
        </div>

        <div>
          <Header
            title="监控"
            secondary
            description="使用日志和指标监视您的 Coder 应用程序。"
          />

          <OptionsTable
            options={options.filter((o) =>
              deploymentGroupHasParent(o.group, "Introspection"),
            )}
          />
        </div>
      </Stack>
    </>
  );
};
