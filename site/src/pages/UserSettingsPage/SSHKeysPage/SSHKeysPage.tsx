import { PropsWithChildren, FC, useState } from "react";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { Section } from "components/SettingsLayout/Section";
import { SSHKeysPageView } from "./SSHKeysPageView";
import { regenerateUserSSHKey, userSSHKey } from "api/queries/sshKeys";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getErrorMessage } from "api/errors";

export const Language = {
  title: "SSH 密钥",
  regenerateDialogTitle: "重置密钥?",
  regenerateDialogMessage:
    "您将需要替换与它一起使用的Git服务器上的公共 SSH 密钥，并且您需要重建现有工作区。",
  confirmLabel: "确认",
  cancelLabel: "取消",
}

export const SSHKeysPage: FC<PropsWithChildren<unknown>> = () => {
  const [isConfirmingRegeneration, setIsConfirmingRegeneration] =
    useState(false);
  const queryClient = useQueryClient();
  const userSSHKeyQuery = useQuery(userSSHKey("me"));
  const regenerateSSHKeyMutation = useMutation(
    regenerateUserSSHKey("me", queryClient),
  );

  return (
    <>
      <Section title={Language.title}>
        <SSHKeysPageView
          isLoading={userSSHKeyQuery.isLoading}
          getSSHKeyError={userSSHKeyQuery.error}
          regenerateSSHKeyError={regenerateSSHKeyMutation.error}
          sshKey={userSSHKeyQuery.data}
          onRegenerateClick={() => {
            setIsConfirmingRegeneration(true);
          }}
        />
      </Section>

      <ConfirmDialog
        type="delete"
        hideCancel={false}
        open={isConfirmingRegeneration}
        confirmLoading={regenerateSSHKeyMutation.isLoading}
        title={Language.regenerateDialogTitle}
        confirmText={Language.confirmLabel}
        onConfirm={async () => {
          try {
            await regenerateSSHKeyMutation.mutateAsync();
            displaySuccess("SSH Key regenerated successfully.");
          } catch (error) {
            displayError(
              getErrorMessage(error, "Failed to regenerate SSH key"),
            );
          } finally {
            setIsConfirmingRegeneration(false);
          }
        }}
        onClose={() => {
          setIsConfirmingRegeneration(false);
        }}
        description={<>{Language.regenerateDialogMessage}</>}
      />
    </>
  );
};

export default SSHKeysPage;
