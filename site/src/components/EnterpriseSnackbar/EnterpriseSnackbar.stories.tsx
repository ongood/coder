import { Story } from "@storybook/react"
import {
  EnterpriseSnackbar,
  EnterpriseSnackbarProps,
} from "./EnterpriseSnackbar"

export default {
  title: "components/EnterpriseSnackbar",
  component: EnterpriseSnackbar,
}

const Template: Story<EnterpriseSnackbarProps> = (
  args: EnterpriseSnackbarProps,
) => <EnterpriseSnackbar {...args} />

export const Error = Template.bind({})
Error.args = {
  variant: "error",
  open: true,
  message: "哎呀，出错了。",
}

export const Info = Template.bind({})
Info.args = {
  variant: "info",
  open: true,
  message: "嘿，发生了一些事情。",
}

export const Success = Template.bind({})
Success.args = {
  variant: "success",
  open: true,
  message: "嘿，发生了一些好事情。",
}
