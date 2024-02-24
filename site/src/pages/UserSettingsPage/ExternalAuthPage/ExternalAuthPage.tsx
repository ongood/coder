import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  externalAuths,
  unlinkExternalAuths,
  validateExternalAuth,
} from "api/queries/externalAuth";
import { getErrorMessage } from "api/errors";
import { DeleteDialog } from "components/Dialogs/DeleteDialog/DeleteDialog";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { Section } from "../Section";
import { ExternalAuthPageView } from "./ExternalAuthPageView";

const ExternalAuthPage: FC = () => {
  const queryClient = useQueryClient();
  // This is used to tell the child components something was unlinked and things
  // need to be refetched
  const [unlinked, setUnlinked] = useState(0);

  const externalAuthsQuery = useQuery(externalAuths());
  const [appToUnlink, setAppToUnlink] = useState<string>();
  const unlinkAppMutation = useMutation(unlinkExternalAuths(queryClient));
  const validateAppMutation = useMutation(validateExternalAuth(queryClient));

  return (
    <Section title="外部验证" layout="fluid">
      <ExternalAuthPageView
        isLoading={externalAuthsQuery.isLoading}
        getAuthsError={externalAuthsQuery.error}
        auths={externalAuthsQuery.data}
        unlinked={unlinked}
        onUnlinkExternalAuth={(providerID: string) => {
          setAppToUnlink(providerID);
        }}
        onValidateExternalAuth={async (providerID: string) => {
          try {
            const data = await validateAppMutation.mutateAsync(providerID);
            if (data.authenticated) {
              displaySuccess("应用链接有效。");
            } else {
              displayError(
                "应用链接无效。请取消链接该应用并重新验证身份。",
              );
            }
          } catch (e) {
            displayError(
              getErrorMessage(e, "验证应用链接时出错。"),
            );
          }
        }}
      />
      <DeleteDialog
        key={appToUnlink}
        title="取消链接应用"
        verb="取消链接"
        info="这不会从oauth2提供者那里撤销访问令牌。 它只会在此端删除链接。 要完全撤销访问权限，您必须在oauth2提供者端执行此操作。"
        label="要取消链接的应用名称"
        isOpen={appToUnlink !== undefined}
        confirmLoading={unlinkAppMutation.isLoading}
        name={appToUnlink ?? ""}
        entity="应用程序"
        onCancel={() => setAppToUnlink(undefined)}
        onConfirm={async () => {
          try {
            await unlinkAppMutation.mutateAsync(appToUnlink!);
            // setAppToUnlink closes the modal
            setAppToUnlink(undefined);
            // refetch repopulates the external auth data
            await externalAuthsQuery.refetch();
            // this tells our child components to refetch their data
            // as at least 1 provider was unlinked.
            setUnlinked(unlinked + 1);

            displaySuccess("成功取消链接oauth2应用程序。");
          } catch (e) {
            displayError(getErrorMessage(e, "取消链接应用程序时出错。"));
          }
        }}
      />
    </Section>
  );
};

export default ExternalAuthPage;
