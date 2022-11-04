import { useDeploySettings } from "components/DeploySettingsLayout/DeploySettingsLayout"
import { Header } from "components/DeploySettingsLayout/Header"
import OptionsTable from "components/DeploySettingsLayout/OptionsTable"
import React from "react"
import { Helmet } from "react-helmet-async"
import { pageTitle } from "util/page"

const GeneralSettingsPage: React.FC = () => {
  const { deploymentConfig: deploymentConfig } = useDeploySettings()

  return (
    <>
      <Helmet>
        <title>{pageTitle("常规设置")}</title>
      </Helmet>

      <Header
        title="常规"
        description="有关您的 Coder 部署的信息。"
        docsHref="https://coder.com/docs/coder-oss/latest/admin/configure"
      />

      <OptionsTable
        options={{
          access_url: deploymentConfig.access_url,
          address: deploymentConfig.address,
          wildcard_access_url: deploymentConfig.wildcard_access_url,
        }}
      />
    </>
  )
}

export default GeneralSettingsPage
