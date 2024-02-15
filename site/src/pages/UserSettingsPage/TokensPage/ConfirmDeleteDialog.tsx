import { FC } from "react";
import { ConfirmDialog } from "components/Dialogs/ConfirmDialog/ConfirmDialog";
import { useDeleteToken } from "./hooks";
import { displaySuccess, displayError } from "components/GlobalSnackbar/utils";
import { getErrorMessage } from "api/errors";
import { APIKeyWithOwner } from "api/typesGenerated";

export interface ConfirmDeleteDialogProps {
  queryKey: (string | boolean)[];
  token: APIKeyWithOwner | undefined;
  setToken: (arg: APIKeyWithOwner | undefined) => void;
}

export const ConfirmDeleteDialog: FC<ConfirmDeleteDialogProps> = ({
  queryKey,
  token,
  setToken,
}) => {
  const tokenName = token?.token_name;

  const { mutate: deleteToken, isLoading: isDeleting } =
    useDeleteToken(queryKey);

  const onDeleteSuccess = () => {
    displaySuccess("令牌已删除");
    setToken(undefined);
  };

  const onDeleteError = (error: unknown) => {
    const message = getErrorMessage(error, "删除令牌失败");
    displayError(message);
    setToken(undefined);
  };

  return (
    <ConfirmDialog
      type="delete"
      title="删除令牌"
      description={
        <>
          您确定要永久删除令牌{" "}吗？
          <strong>{tokenName}</strong>?
        </>
      }
      open={Boolean(token) || isDeleting}
      confirmLoading={isDeleting}
      onConfirm={() => {
        if (!token) {
          return;
        }
        deleteToken(token.id, {
          onError: onDeleteError,
          onSuccess: onDeleteSuccess,
        });
      }}
      onClose={() => {
        setToken(undefined);
      }}
    />
  );
};
