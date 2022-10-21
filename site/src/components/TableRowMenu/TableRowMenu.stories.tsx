import { ComponentMeta, Story } from "@storybook/react"
import { TableRowMenu, TableRowMenuProps } from "./TableRowMenu"

export default {
  title: "components/TableRowMenu",
  component: TableRowMenu,
} as ComponentMeta<typeof TableRowMenu>

type DataType = {
  id: string
}

const Template: Story<TableRowMenuProps<DataType>> = (args) => (
  <TableRowMenu {...args} />
)

export const Example = Template.bind({})
Example.args = {
  data: { id: "123" },
  menuItems: [
    { label: "暂停", onClick: (data) => alert(data.id) },
    { label: "升级", onClick: (data) => alert(data.id) },
    { label: "删除", onClick: (data) => alert(data.id) },
  ],
}
