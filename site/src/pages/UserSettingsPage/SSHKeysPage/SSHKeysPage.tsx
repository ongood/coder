import { type FC, useState } from "react";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { Section } from "../Section";
import { SSHKeysPageView } from "./SSHKeysPageView";
import { regenerateUserSSHKey, userSSHKey } from "api/queries/sshKeys";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getErrorMessage } from "api/errors";

export const Language = {
  title: "SSH 密钥",
  regenerateDialogTitle: "重新生成 SSH 密钥？",
  regenerationError: "重新生成 SSH 密钥失败",
  regenerationSuccess: "SSH 密钥重新生成成功。",
  regenerateDialogMessage:
    "您将需要替换与它一起使用的Git服务器上的公共 SSH 密钥，并且您需要重建现有工作区。",
  confirmLabel: "确认",
  cancelLabel: "取消",
}

export const SSHKeysPage: FC = () => {
  const [isConfirmingRegeneration, setIsConfirmingRegeneration] =
    useState(false);

  const userSSHKeyQuery = useQuery(userSSHKey("me"));
  const queryClient = useQueryClient();
  const regenerateSSHKeyMutation = useMutation(
    regenerateUserSSHKey("me", queryClient),
  );

  return (
    <>
      <Section title={Language.title}>
        <SSHKeysPageView
          isLoading={userSSHKeyQuery.isLoading}
          getSSHKeyError={userSSHKeyQuery.error}
          sshKey={userSSHKeyQuery.data}
          onRegenerateClick={() => setIsConfirmingRegeneration(true)}
        />
      </Section>

      <ConfirmDialog
        type="delete"
        hideCancel={false}
        open={isConfirmingRegeneration}
        confirmLoading={regenerateSSHKeyMutation.isLoading}
        title={Language.regenerateDialogTitle}
        description={Language.regenerateDialogMessage}
        confirmText={Language.confirmLabel}
        onClose={() => setIsConfirmingRegeneration(false)}
        onConfirm={async () => {
          try {
            await regenerateSSHKeyMutation.mutateAsync();
            displaySuccess(Language.regenerationSuccess);
          } catch (error) {
            displayError(getErrorMessage(error, Language.regenerationError));
          } finally {
            setIsConfirmingRegeneration(false);
          }
        }}
      />
    </>
  );
};

export default SSHKeysPage;
