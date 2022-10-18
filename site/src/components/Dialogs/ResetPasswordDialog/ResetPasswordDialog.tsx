import DialogContentText from "@material-ui/core/DialogContentText"
import { makeStyles } from "@material-ui/core/styles"
import { FC } from "react"
import * as TypesGen from "../../../api/typesGenerated"
import { CodeExample } from "../../CodeExample/CodeExample"
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog"

export interface ResetPasswordDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  user?: TypesGen.User
  newPassword?: string
  loading: boolean
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
  const styles = useStyles()

  const description = (
    <>
      <DialogContentText variant="subtitle2">
        {Language.message(user?.username)}
      </DialogContentText>
      <DialogContentText component="div" className={styles.codeBlock}>
        <CodeExample code={newPassword ?? ""} className={styles.codeExample} />
      </DialogContentText>
    </>
  )

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
  )
}

const useStyles = makeStyles(() => ({
  codeBlock: {
    marginBottom: 0,
  },
  codeExample: {
    minHeight: "auto",
    userSelect: "all",
    width: "100%",
  },
}))
