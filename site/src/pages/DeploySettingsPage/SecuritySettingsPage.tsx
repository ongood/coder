import { useActor } from "@xstate/react"
import { FeatureNames } from "api/types"
import {
  Badges,
  DisabledBadge,
  EnabledBadge,
  EnterpriseBadge,
} from "components/DeploySettingsLayout/Badges"
import { useDeploySettings } from "components/DeploySettingsLayout/DeploySettingsLayout"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"
import { Stack } from "components/Stack/Stack"
import React, { useContext } from "react"
import { Helmet } from "react-helmet-async"
import { pageTitle } from "util/page"
import { XServiceContext } from "xServices/StateContext"

const SecuritySettingsPage: React.FC = () => {
  const { deploymentConfig: deploymentConfig } = useDeploySettings()
  const xServices = useContext(XServiceContext)
  const [entitlementsState] = useActor(xServices.entitlementsXService)

  return (
    <>
      <Helmet>
        <title>{pageTitle("安全设置")}</title>
      </Helmet>
      <Stack direction="column" spacing={6}>
        <div>
          <Header
            title="安全"
            description="确保您的 Coder 部署是安全的。"
          />

          <OptionsTable
            options={{
              ssh_keygen_algorithm: deploymentConfig.ssh_keygen_algorithm,
              secure_auth_cookie: deploymentConfig.secure_auth_cookie,
            }}
          />
        </div>

        <div>
          <Header
            title="审计日志"
            secondary
            description="允许审计员监视部署中的用户操作"
            docsHref="https://coder.com/docs/coder-oss/latest/admin/audit-logs"
          />

          <Badges>
            {entitlementsState.context.entitlements.features[
              FeatureNames.AuditLog
            ].enabled ? (
              <EnabledBadge />
            ) : (
              <DisabledBadge />
            )}
            <EnterpriseBadge />
          </Badges>
        </div>

        <div>
          <Header
            title="仅浏览器连接"
            secondary
            description="阻止所有通过 SSH、端口转发和其他非浏览器连接访问工作区。"
            docsHref="https://coder.com/docs/coder-oss/latest/networking#browser-only-connections-enterprise"
          />

          <Badges>
            {entitlementsState.context.entitlements.features[
              FeatureNames.BrowserOnly
            ].enabled ? (
              <EnabledBadge />
            ) : (
              <DisabledBadge />
            )}
            <EnterpriseBadge />
          </Badges>
        </div>

        <div>
          <Header
            title="TLS"
            secondary
            description="确保为你的编码器部署正确配置 TLS."
          />

          <OptionsTable
            options={{
              tls_enable: deploymentConfig.tls.enable,
              tls_cert_files: deploymentConfig.tls.cert_file,
              tls_key_files: deploymentConfig.tls.key_file,
              tls_min_version: deploymentConfig.tls.min_version,
            }}
          />
        </div>
      </Stack>
    </>
  )
}

export default SecuritySettingsPage
