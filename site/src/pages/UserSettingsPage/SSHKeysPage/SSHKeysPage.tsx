import { useActor } from "@xstate/react"
import React, { useContext, useEffect } from "react"
import { ConfirmDialog } from "../../../components/Dialogs/ConfirmDialog/ConfirmDialog"
import { Section } from "../../../components/Section/Section"
import { XServiceContext } from "../../../xServices/StateContext"
import { SSHKeysPageView } from "./SSHKeysPageView"

export const Language = {
  title: "SSH 密钥",
  description: (
    <p>
       以下公钥用于在工作区中对 Git 进行身份验证。
       您可以将其添加到您需要从工作区访问的 Git 服务器（例如 GitHub）。<br />
      <br />
      Coder 通过此方式配置身份验证: <code>$GIT_SSH_COMMAND</code>.
    </p>
  ),
  regenerateDialogTitle: "重新生成 SSH 密钥？",
  regenerateDialogMessage:
    "您将需要替换与它一起使用的Git服务器上的公共 SSH 密钥，并且您需要重建现有工作区。",
  confirmLabel: "确认",
  cancelLabel: "取消",
}

export const SSHKeysPage: React.FC<React.PropsWithChildren<unknown>> = () => {
  const xServices = useContext(XServiceContext)
  const [authState, authSend] = useActor(xServices.authXService)
  const { sshKey, getSSHKeyError, regenerateSSHKeyError } = authState.context

  useEffect(() => {
    authSend({ type: "GET_SSH_KEY" })
  }, [authSend])

  const isLoading = authState.matches("signedIn.ssh.gettingSSHKey")
  const hasLoaded = authState.matches("signedIn.ssh.loaded")

  const onRegenerateClick = () => {
    authSend({ type: "REGENERATE_SSH_KEY" })
  }

  return (
    <>
      <Section title={Language.title} description={Language.description}>
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
        open={authState.matches("signedIn.ssh.loaded.confirmSSHKeyRegenerate")}
        confirmLoading={authState.matches(
          "signedIn.ssh.loaded.regeneratingSSHKey",
        )}
        title={Language.regenerateDialogTitle}
        confirmText={Language.confirmLabel}
        onConfirm={() => {
          authSend({ type: "CONFIRM_REGENERATE_SSH_KEY" })
        }}
        onClose={() => {
          authSend({ type: "CANCEL_REGENERATE_SSH_KEY" })
        }}
        description={<>{Language.regenerateDialogMessage}</>}
      />
    </>
  )
}

export default SSHKeysPage
