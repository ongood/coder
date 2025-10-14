import { getErrorMessage } from "api/errors";
import { regenerateUserSSHKey, userSSHKey } from "api/queries/sshKeys";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { displayError, displaySuccess } from "components/GlobalSnackbar/utils";
import { type FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Section } from "../Section";
import { SSHKeysPageView } from "./SSHKeysPageView";

export const Language = {
	title: "SSH 密钥",
	regenerateDialogTitle: "重新生成 SSH 密钥？",
	regenerationError: "重新生成 SSH 密钥失败",
	regenerationSuccess: "SSH 密钥重新生成成功。",
	regenerateDialogMessage:
		"您需要在使用的服务上替换公钥 SSH 密钥，并且需要重新构建现有的工作区。",
	confirmLabel: "确认",
	cancelLabel: "取消",
};

const SSHKeysPage: FC = () => {
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
				confirmLoading={regenerateSSHKeyMutation.isPending}
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
