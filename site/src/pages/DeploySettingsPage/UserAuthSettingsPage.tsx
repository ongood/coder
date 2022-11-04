import {
  Badges,
  DisabledBadge,
  EnabledBadge,
} from "components/DeploySettingsLayout/Badges"
import { useDeploySettings } from "components/DeploySettingsLayout/DeploySettingsLayout"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"
import { Stack } from "components/Stack/Stack"
import React from "react"
import { Helmet } from "react-helmet-async"
import { pageTitle } from "util/page"

const UserAuthSettingsPage: React.FC = () => {
  const { deploymentConfig: deploymentConfig } = useDeploySettings()

  return (
    <>
      <Helmet>
        <title>{pageTitle("用户身份验证设置")}</title>
      </Helmet>

      <Stack direction="column" spacing={6}>
        <div>
          <Header title="用户身份验证" />

          <Header
            title="使用 OpenID Connect 登录"
            secondary
            description="设置身份验证以使用 OpenID Connect 登录。"
            docsHref="https://coder.com/docs/coder-oss/latest/admin/auth#openid-connect-with-google"
          />

          <Badges>
            {deploymentConfig.oidc.client_id.value ? (
              <EnabledBadge />
            ) : (
              <DisabledBadge />
            )}
          </Badges>

          <OptionsTable
            options={{
              client_id: deploymentConfig.oidc.client_id,
              allow_signups: deploymentConfig.oidc.allow_signups,
              email_domain: deploymentConfig.oidc.email_domain,
              issuer_url: deploymentConfig.oidc.issuer_url,
              scopes: deploymentConfig.oidc.scopes,
            }}
          />
        </div>

        <div>
          <Header
            title="使用 GitHub 登录"
            secondary
            description="设置身份验证以使用 GitHub 登录。"
            docsHref="https://coder.com/docs/coder-oss/latest/admin/auth#github"
          />

          <Badges>
            {deploymentConfig.oauth2.github.client_id.value ? (
              <EnabledBadge />
            ) : (
              <DisabledBadge />
            )}
          </Badges>

          <OptionsTable
            options={{
              client_id: deploymentConfig.oauth2.github.client_id,
              allow_signups: deploymentConfig.oauth2.github.allow_signups,
              allowed_orgs: deploymentConfig.oauth2.github.allowed_orgs,
              allowed_teams: deploymentConfig.oauth2.github.allowed_teams,
              enterprise_base_url:
                deploymentConfig.oauth2.github.enterprise_base_url,
            }}
          />
        </div>
      </Stack>
    </>
  )
}

export default UserAuthSettingsPage
