import { type FC } from "react";
import { Helmet } from "react-helmet-async";
import { pageTitle } from "utils/page";
import { useDeploySettings } from "../DeploySettingsLayout";
import { UserAuthSettingsPageView } from "./UserAuthSettingsPageView";

const UserAuthSettingsPage: FC = () => {
  const { deploymentValues: deploymentValues } = useDeploySettings();

  return (
    <>
      <Helmet>
        <title>{pageTitle("用户认证设置")}</title>
      </Helmet>

      <UserAuthSettingsPageView options={deploymentValues.options} />
    </>
  );
};

export default UserAuthSettingsPage;
