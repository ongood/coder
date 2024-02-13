import type { ClibaseOption } from "api/typesGenerated";
import { Badges, DisabledBadge, EnabledBadge } from "components/Badges/Badges";
import { Stack } from "components/Stack/Stack";
import { Header } from "../Header";
import OptionsTable from "../OptionsTable";
import {
  deploymentGroupHasParent,
  useDeploymentOptions,
} from "utils/deployOptions";
import { docs } from "utils/docs";

export type UserAuthSettingsPageViewProps = {
  options: ClibaseOption[];
};

export const UserAuthSettingsPageView = ({
  options,
}: UserAuthSettingsPageViewProps): JSX.Element => {
  const oidcEnabled = Boolean(
    useDeploymentOptions(options, "OIDC Client ID")[0].value,
  );
  const githubEnabled = Boolean(
    useDeploymentOptions(options, "OAuth2 GitHub Client ID")[0].value,
  );

  return (
    <>
      <Stack direction="column" spacing={6}>
        <div>
          <Header title="用户认证" />

          <Header
            title="使用 OpenID 连接登录"
            secondary
            description="设置身份验证以使用 OpenID 连接登录。"
            docsHref={docs("/admin/auth#openid-connect-with-google")}
          />

          <Badges>{oidcEnabled ? <EnabledBadge /> : <DisabledBadge />}</Badges>

          {oidcEnabled && (
            <OptionsTable
              options={options.filter((o) =>
                deploymentGroupHasParent(o.group, "OIDC"),
              )}
            />
          )}
        </div>

        <div>
          <Header
            title="使用 GitHub 登录"
            secondary
            description="设置身份验证以使用 GitHub 登录。"
            docsHref={docs("/admin/auth#github")}
          />

          <Badges>
            {githubEnabled ? <EnabledBadge /> : <DisabledBadge />}
          </Badges>

          {githubEnabled && (
            <OptionsTable
              options={options.filter((o) =>
                deploymentGroupHasParent(o.group, "GitHub"),
              )}
            />
          )}
        </div>
      </Stack>
    </>
  );
};
