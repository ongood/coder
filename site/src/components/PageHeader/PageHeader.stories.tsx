import { ComponentMeta, Story } from "@storybook/react"
import { PageHeader, PageHeaderSubtitle, PageHeaderTitle } from "./PageHeader"

export default {
  title: "components/PageHeader",
  component: PageHeader,
} as ComponentMeta<typeof PageHeader>

const WithTitleTemplate: Story = () => (
  <PageHeader>
    <PageHeaderTitle>模板</PageHeaderTitle>
  </PageHeader>
)

export const WithTitle = WithTitleTemplate.bind({})

const WithSubtitleTemplate: Story = () => (
  <PageHeader>
    <PageHeaderTitle>模板</PageHeaderTitle>
    <PageHeaderSubtitle>
      从模板创建新的工作区
    </PageHeaderSubtitle>
  </PageHeader>
)

export const WithSubtitle = WithSubtitleTemplate.bind({})
