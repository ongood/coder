import { LoadingButton } from "./LoadingButton";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof LoadingButton> = {
  title: "components/LoadingButton",
  component: LoadingButton,
  args: {
    children: "创建工作区",
  },
};

export default meta;
type Story = StoryObj<typeof LoadingButton>;

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const NotLoading: Story = {
  args: {
    loading: false,
  },
};
