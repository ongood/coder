import { DeploymentConfig } from "api/typesGenerated"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"

export type GeneralSettingsPageViewProps = {
  deploymentConfig: Pick<DeploymentConfig, "access_url" | "wildcard_access_url">
}
export const GeneralSettingsPageView = ({
  deploymentConfig,
}: GeneralSettingsPageViewProps): JSX.Element => {
  return (
    <>
      <Header
        title="常规"
        description="有关您的 Coder 部署的信息。"
        docsHref="https://coder.com/docs/coder-oss/latest/admin/configure"
      />
      <OptionsTable
        options={{
          access_url: deploymentConfig.access_url,
          wildcard_access_url: deploymentConfig.wildcard_access_url,
        }}
      />
    </>
  )
}
