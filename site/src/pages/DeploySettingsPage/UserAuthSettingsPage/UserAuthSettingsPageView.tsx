import { DeploymentOption } from "api/types"
import {
  Badges,
  DisabledBadge,
  EnabledBadge,
} from "components/DeploySettingsLayout/Badges"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"
import { Stack } from "components/Stack/Stack"
import {
  deploymentGroupHasParent,
  useDeploymentOptions,
} from "utils/deployOptions"

export type UserAuthSettingsPageViewProps = {
  options: DeploymentOption[]
}

export const UserAuthSettingsPageView = ({
  options,
}: UserAuthSettingsPageViewProps): JSX.Element => (
  <>
    <Stack direction="column" spacing={6}>
      <div>
        <Header title="用户认证" />

        <Header
          title="使用OpenID Connect登录"
          secondary
          description="设置使用OpenID Connect进行登录的认证方式。"
          docsHref="https://coder.com/docs/coder-oss/latest/admin/auth#openid-connect-with-google"
        />

        <Badges>
          {useDeploymentOptions(options, "OIDC Client ID")[0].value ? (
            <EnabledBadge />
          ) : (
            <DisabledBadge />
          )}
        </Badges>

        <OptionsTable
          options={options.filter((o) =>
            deploymentGroupHasParent(o.group, "OIDC"),
          )}
        />
      </div>

      <div>
        <Header
          title="使用GitHub登录"
          secondary
          description="设置使用GitHub进行登录的认证方式。"
          docsHref="https://coder.com/docs/coder-oss/latest/admin/auth#github"
        />

        <Badges>
          {useDeploymentOptions(options, "OAuth2 GitHub Client ID")[0].value ? (
            <EnabledBadge />
          ) : (
            <DisabledBadge />
          )}
        </Badges>

        <OptionsTable
          options={options.filter((o) =>
            deploymentGroupHasParent(o.group, "GitHub"),
          )}
        />
      </div>
    </Stack>
  </>
)
