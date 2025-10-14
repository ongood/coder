import type * as TypesGen from "api/typesGenerated";
import { CodeExample } from "components/CodeExample/CodeExample";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import type { FC, JSX } from "react";

interface ResetPasswordDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	user?: TypesGen.User;
	newPassword?: string;
	loading: boolean;
}

const Language = {
	title: "重置密码",
	message: (username?: string): JSX.Element => (
		<>
			您需要将以下密码发送给 <strong>{username}</strong>：
		</>
	),
	confirmText: "重置密码",
};

export const ResetPasswordDialog: FC<ResetPasswordDialogProps> = ({
	open,
	onClose,
	onConfirm,
	user,
	newPassword,
	loading,
}) => {
	const description = (
		<>
			<p>{Language.message(user?.username)}</p>
			<CodeExample
				secret={false}
				code={newPassword ?? ""}
				css={{
					minHeight: "auto",
					userSelect: "all",
					width: "100%",
					marginTop: 24,
				}}
			/>
		</>
	);

	return (
		<ConfirmDialog
			type="info"
			hideCancel={false}
			open={open}
			onConfirm={onConfirm}
			onClose={onClose}
			title={Language.title}
			confirmLoading={loading}
			confirmText={Language.confirmText}
			description={description}
		/>
	);
};
