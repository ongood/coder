import { DeploymentOption } from "api/types"
import {
  Badges,
  DisabledBadge,
  EnabledBadge,
  EnterpriseBadge,
} from "components/DeploySettingsLayout/Badges"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"
import { Stack } from "components/Stack/Stack"
import {
  deploymentGroupHasParent,
  useDeploymentOptions,
} from "utils/deployOptions"

export type SecuritySettingsPageViewProps = {
  options: DeploymentOption[]
  featureAuditLogEnabled: boolean
  featureBrowserOnlyEnabled: boolean
}
export const SecuritySettingsPageView = ({
  options: options,
  featureAuditLogEnabled,
  featureBrowserOnlyEnabled,
}: SecuritySettingsPageViewProps): JSX.Element => (
  <>
    <Stack direction="column" spacing={6}>
      <div>
        <Header
          title="安全性"
          description="确保您的Coder部署是安全的。"
        />

        <OptionsTable
          options={useDeploymentOptions(
            options,
            "SSH Keygen Algorithm",
            "Secure Auth Cookie",
            "Disable Owner Workspace Access",
          )}
        />
      </div>

      <div>
        <Header
          title="审计日志"
          secondary
          description="允许审计人员监控您的部署中的用户操作。"
          docsHref="https://coder.com/docs/coder-oss/latest/admin/audit-logs"
        />

        <Badges>
          {featureAuditLogEnabled ? <EnabledBadge /> : <DisabledBadge />}
          <EnterpriseBadge />
        </Badges>
      </div>

      <div>
        <Header
          title="仅限浏览器连接"
          secondary
          description="阻止通过SSH、端口转发和其他非浏览器连接访问所有工作区。"
          docsHref="https://coder.com/docs/coder-oss/latest/networking#browser-only-connections-enterprise"
        />

        <Badges>
          {featureBrowserOnlyEnabled ? <EnabledBadge /> : <DisabledBadge />}
          <EnterpriseBadge />
        </Badges>
      </div>

      <div>
        <Header
          title="TLS"
          secondary
          description="确保为您的Coder部署正确配置了TLS。"
        />

        <OptionsTable
          options={options.filter((o) =>
            deploymentGroupHasParent(o.group, "TLS"),
          )}
        />
      </div>
    </Stack>
  </>
)
