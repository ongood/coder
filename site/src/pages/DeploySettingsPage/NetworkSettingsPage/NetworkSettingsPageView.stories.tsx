import type { Meta, StoryObj } from "@storybook/react";
import type { SerpentGroup } from "api/typesGenerated";
import { NetworkSettingsPageView } from "./NetworkSettingsPageView";

const group: SerpentGroup = {
  name: "Networking",
  description: "",
};

const meta: Meta<typeof NetworkSettingsPageView> = {
  title: "pages/DeploySettingsPage/NetworkSettingsPageView",
  component: NetworkSettingsPageView,
  args: {
    options: [
      {
        name: "DERP Server Enable",
        description:"是否启用或禁用嵌入式DERP中继服务器。",
        value: true,
        group,
        flag: "derp",
        flag_shorthand: "d",
        hidden: false,
      },
      {
        name: "DERP Server Region Name",
        description: "嵌入式DERP服务器的区域名称",
        value: "aws-east",
        group,
        flag: "derp",
        flag_shorthand: "d",
        hidden: false,
      },
      {
        name: "DERP Server STUN Addresses",
        description:"用于建立点对点连接的STUN服务器地址。将其设置为空以禁用点对点连接。",
        value: ["stun.l.google.com:19302", "stun.l.google.com:19301"],
        group,
        flag: "derp",
        flag_shorthand: "d",
        hidden: false,
      },
      {
        name: "DERP Config URL",
        description:"启动时获取DERP映射的URL。参见：https://tailscale.com/kb/1118/custom-derp-servers/",
        value: "https://coder.com",
        group,
        flag: "derp",
        flag_shorthand: "d",
        hidden: false,
      },
      {
        name: "Wildcard Access URL",
        description: "",
        value: "https://coder.com",
        group,
        flag: "derp",
        flag_shorthand: "d",
        hidden: false,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof NetworkSettingsPageView>;

export const Page: Story = {};
