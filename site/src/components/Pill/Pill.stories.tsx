import { Story } from "@storybook/react"
import { Pill, PillProps } from "./Pill"

export default {
  title: "components/Pill",
  component: Pill,
}

const Template: Story<PillProps> = (args) => <Pill {...args} />

export const Primary = Template.bind({})
Primary.args = {
  text: "主要",
  type: "primary",
}

export const Secondary = Template.bind({})
Secondary.args = {
  text: "次要",
  type: "secondary",
}

export const Success = Template.bind({})
Success.args = {
  text: "成功",
  type: "success",
}

export const Info = Template.bind({})
Info.args = {
  text: "信息",
  type: "info",
}

export const Warning = Template.bind({})
Warning.args = {
  text: "警告",
  type: "warning",
}

export const Error = Template.bind({})
Error.args = {
  text: "错误",
  type: "error",
}

export const Default = Template.bind({})
Default.args = {
  text: "默认",
}

export const WarningLight = Template.bind({})
WarningLight.args = {
  text: "警告",
  type: "warning",
  lightBorder: true,
}
