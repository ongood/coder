import Box from "@material-ui/core/Box"
import { FC } from "react"
import { Helmet } from "react-helmet-async"
import { Outlet } from "react-router-dom"
import { pageTitle } from "../../util/page"
import { AuthAndFrame } from "../AuthAndFrame/AuthAndFrame"
import { Margins } from "../Margins/Margins"
import { TabPanel } from "../TabPanel/TabPanel"

export const Language = {
  accountLabel: "账号",
  securityLabel: "安全",
  sshKeysLabel: "SSH 密钥",
  settingsLabel: "设置",
}

const menuItems = [
  { label: Language.accountLabel, path: "/settings/account" },
  { label: Language.securityLabel, path: "/settings/security" },
  { label: Language.sshKeysLabel, path: "/settings/ssh-keys" },
]

export const SettingsLayout: FC = () => {
  return (
    <AuthAndFrame>
      <Box display="flex" flexDirection="column">
        <Helmet>
          <title>{pageTitle("Settings")}</title>
        </Helmet>
        <Margins>
          <TabPanel title={Language.settingsLabel} menuItems={menuItems}>
            <Outlet />
          </TabPanel>
        </Margins>
      </Box>
    </AuthAndFrame>
  )
}
