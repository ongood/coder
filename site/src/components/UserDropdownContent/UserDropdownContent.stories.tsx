import { Story } from "@storybook/react"
import { MockUser } from "../../testHelpers/entities"
import {
  UserDropdownContent,
  UserDropdownContentProps,
} from "./UserDropdownContent"

export default {
  title: "components/UserDropdownContent",
  component: UserDropdownContent,
}

const Template: Story<UserDropdownContentProps> = (args) => (
  <UserDropdownContent {...args} />
)

export const ExampleNoRoles = Template.bind({})
ExampleNoRoles.args = {
  user: {
    ...MockUser,
    roles: [],
  },
}

export const ExampleOneRole = Template.bind({})
ExampleOneRole.args = {
  user: {
    ...MockUser,
    roles: [{ name: "member", display_name: "成员" }],
  },
}

export const ExampleThreeRoles = Template.bind({})
ExampleThreeRoles.args = {
  user: {
    ...MockUser,
    roles: [
      { name: "admin", display_name: "管理员" },
      { name: "member", display_name: "成员" },
      { name: "auditor", display_name: "审计员" },
    ],
  },
}
