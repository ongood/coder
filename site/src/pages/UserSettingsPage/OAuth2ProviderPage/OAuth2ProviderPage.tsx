import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getErrorMessage } from "api/errors";
import { getApps, revokeApp } from "api/queries/oauth2";
import { DeleteDialog } from "components/Dialogs/DeleteDialog/DeleteDialog";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { useAuthenticated } from "contexts/auth/RequireAuth";
import { Section } from "../Section";
import OAuth2ProviderPageView from "./OAuth2ProviderPageView";

const OAuth2ProviderPage: FC = () => {
  const { user: me } = useAuthenticated();
  const queryClient = useQueryClient();
  const userOAuth2AppsQuery = useQuery(getApps(me.id));
  const revokeAppMutation = useMutation(revokeApp(queryClient, me.id));
  const [appIdToRevoke, setAppIdToRevoke] = useState<string>();
  const appToRevoke = userOAuth2AppsQuery.data?.find(
    (app) => app.id === appIdToRevoke,
  );

  return (
    <Section title="OAuth2 应用程序" layout="fluid">
      <OAuth2ProviderPageView
        isLoading={userOAuth2AppsQuery.isLoading}
        error={userOAuth2AppsQuery.error}
        apps={userOAuth2AppsQuery.data}
        revoke={(app) => {
          setAppIdToRevoke(app.id);
        }}
      />
      {appToRevoke !== undefined && (
        <DeleteDialog
          title="撤销应用程序"
          verb="正在撤销"
          info={`这将使 OAuth2 应用程序 "${appToRevoke.name}" 创建的任何令牌失效。`}
          label="待撤销的应用程序名称"
          isOpen
          confirmLoading={revokeAppMutation.isLoading}
          name={appToRevoke.name}
          entity="应用程序"
          onCancel={() => setAppIdToRevoke(undefined)}
          onConfirm={async () => {
            try {
              await revokeAppMutation.mutateAsync(appToRevoke.id);
              displaySuccess(
                `您已成功撤销 OAuth2 应用程序 "${appToRevoke.name}"`,
              );
              setAppIdToRevoke(undefined);
            } catch (error) {
              displayError(
                getErrorMessage(error, "撤销应用程序失败。"),
              );
            }
          }}
        />
      )}
    </Section>
  );
};

export default OAuth2ProviderPage;
