import { useMachine } from "@xstate/react"
import { PropsWithChildren, FC } from "react"
import { sshKeyMachine } from "xServices/sshKey/sshKeyXService"
import { ConfirmDialog } from "../../../components/Dialogs/ConfirmDialog/ConfirmDialog"
import { Section } from "../../../components/SettingsLayout/Section"
import { SSHKeysPageView } from "./SSHKeysPageView"

export const Language = {
  title: "SSH 密钥",
  regenerateDialogTitle: "重置密钥?",
  regenerateDialogMessage:
    "您将需要替换与它一起使用的Git服务器上的公共 SSH 密钥，并且您需要重建现有工作区。",
  confirmLabel: "确认",
  cancelLabel: "取消",
}

export const SSHKeysPage: FC<PropsWithChildren<unknown>> = () => {
  const [sshState, sshSend] = useMachine(sshKeyMachine)
  const isLoading = sshState.matches("gettingSSHKey")
  const hasLoaded = sshState.matches("loaded")
  const { getSSHKeyError, regenerateSSHKeyError, sshKey } = sshState.context

  const onRegenerateClick = () => {
    sshSend({ type: "REGENERATE_SSH_KEY" })
  }

  return (
    <>
      <Section title={Language.title}>
        <SSHKeysPageView
          isLoading={isLoading}
          hasLoaded={hasLoaded}
          getSSHKeyError={getSSHKeyError}
          regenerateSSHKeyError={regenerateSSHKeyError}
          sshKey={sshKey}
          onRegenerateClick={onRegenerateClick}
        />
      </Section>

      <ConfirmDialog
        type="delete"
        hideCancel={false}
        open={sshState.matches("confirmSSHKeyRegenerate")}
        confirmLoading={sshState.matches("regeneratingSSHKey")}
        title={Language.regenerateDialogTitle}
        confirmText={Language.confirmLabel}
        onConfirm={() => {
          sshSend({ type: "CONFIRM_REGENERATE_SSH_KEY" })
        }}
        onClose={() => {
          sshSend({ type: "CANCEL_REGENERATE_SSH_KEY" })
        }}
        description={<>{Language.regenerateDialogMessage}</>}
      />
    </>
  )
}

export default SSHKeysPage
