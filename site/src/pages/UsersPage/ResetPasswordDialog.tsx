import { type FC } from "react";
import type * as TypesGen from "api/typesGenerated";
import { CodeExample } from "components/CodeExample/CodeExample";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";

export interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user?: TypesGen.User;
  newPassword?: string;
  loading: boolean;
}

export const Language = {
  title: "重置密码",
  message: (username?: string): JSX.Element => (
    <>
      您需要向 <strong>{username}</strong> 发送以下密码:
    </>
  ),
  confirmText: "重置密码",
}

export const ResetPasswordDialog: FC<
  React.PropsWithChildren<ResetPasswordDialogProps>
> = ({ open, onClose, onConfirm, user, newPassword, loading }) => {
  const description = (
    <>
      <p>{Language.message(user?.username)}</p>
      <CodeExample
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
