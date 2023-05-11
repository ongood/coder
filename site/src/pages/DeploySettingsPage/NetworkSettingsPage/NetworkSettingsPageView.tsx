import { DeploymentOption } from "api/types"
import {
  Badges,
  EnabledBadge,
  DisabledBadge,
} from "components/DeploySettingsLayout/Badges"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"
import { Stack } from "components/Stack/Stack"
import {
  deploymentGroupHasParent,
  useDeploymentOptions,
} from "utils/deployOptions"

export type NetworkSettingsPageViewProps = {
  options: DeploymentOption[]
}

export const NetworkSettingsPageView = ({
  options: options,
}: NetworkSettingsPageViewProps): JSX.Element => (
  <Stack direction="column" spacing={6}>
    <div>
      <Header
        title="网络"
        description="配置您的部署连接性。"
        docsHref="https://coder.com/docs/coder-oss/latest/networking"
      />
      <OptionsTable
        options={options.filter((o) =>
          deploymentGroupHasParent(o.group, "Networking"),
        )}
      />
    </div>

    <div>
      <Header
        title="端口转发"
        secondary
        description="端口转发允许开发人员从本地计算机安全地访问其 Coder 工作区中的进程。"
        docsHref="https://coder.com/docs/coder-oss/latest/networking/port-forwarding"
      />

      <Badges>
        {useDeploymentOptions(options, "Wildcard Access URL")[0].value !==
        "" ? (
          <EnabledBadge />
        ) : (
          <DisabledBadge />
        )}
      </Badges>
    </div>
  </Stack>
)
