import { PageHeader, PageHeaderSubtitle, PageHeaderTitle } from "./PageHeader";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof PageHeader> = {
  title: "components/PageHeader",
  component: PageHeader,
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const WithTitle: Story = {
  args: {
    children: <PageHeaderTitle>模板</PageHeaderTitle>,
  },
};

export const WithSubtitle: Story = {
  args: {
    children: (
      <>
        <PageHeaderTitle>模板</PageHeaderTitle>
        <PageHeaderSubtitle>
        从模板创建新的工作区
        </PageHeaderSubtitle>
      </>
    ),
  },
};
