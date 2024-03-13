import type { FC } from "react";
import type { ClibaseOption } from "api/typesGenerated";
import { Badges, EnabledBadge, DisabledBadge } from "components/Badges/Badges";
import { Stack } from "components/Stack/Stack";
import {
  deploymentGroupHasParent,
  useDeploymentOptions,
} from "utils/deployOptions";
import { docs } from "utils/docs";
import { Header } from "../Header";
import OptionsTable from "../OptionsTable";

export type NetworkSettingsPageViewProps = {
  options: ClibaseOption[];
};

export const NetworkSettingsPageView: FC<NetworkSettingsPageViewProps> = ({
  options: options,
}) => (
  <Stack direction="column" spacing={6}>
    <div>
      <Header
        title="网络"
        description="配置您的部署连接性。"
        docsHref={docs("/networking")}
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
        docsHref={docs("/networking/port-forwarding")}
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
);
