import type { FC } from "react";
import type { ClibaseOption } from "api/typesGenerated";
import {
  Badges,
  DisabledBadge,
  EnabledBadge,
  EnterpriseBadge,
} from "components/Badges/Badges";
import { Stack } from "components/Stack/Stack";
import {
  deploymentGroupHasParent,
  useDeploymentOptions,
} from "utils/deployOptions";
import { docs } from "utils/docs";
import { Header } from "../Header";
import OptionsTable from "../OptionsTable";

export type SecuritySettingsPageViewProps = {
  options: ClibaseOption[];
  featureBrowserOnlyEnabled: boolean;
};

export const SecuritySettingsPageView: FC<SecuritySettingsPageViewProps> = ({
  options: options,
  featureBrowserOnlyEnabled,
}) => {
  const tlsOptions = options.filter((o) =>
    deploymentGroupHasParent(o.group, "TLS"),
  );

  return (
    <Stack direction="column" spacing={6}>
      <div>
        <Header
          title="安全"
          description="确保您的 Coder 部署是安全的。"
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
        title="仅浏览器连接"
        secondary
        description="阻止通过 SSH、端口转发和其他非浏览器连接访问所有工作区。"
        docsHref={docs("/networking#browser-only-connections-enterprise")}
      />

        <Badges>
          {featureBrowserOnlyEnabled ? <EnabledBadge /> : <DisabledBadge />}
          <EnterpriseBadge />
        </Badges>
      </div>

      {tlsOptions.length > 0 && (
        <div>
          <Header
            title="TLS"
            secondary
            description="确保为您的 Coder 部署正确配置了 TLS。"
          />

          <OptionsTable options={tlsOptions} />
        </div>
      )}
    </Stack>
  );
};
