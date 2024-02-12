import Button from "@mui/material/Button";
import { EmptyState } from "./EmptyState";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof EmptyState> = {
  title: "components/EmptyState",
  component: EmptyState,
  args: {
    message: "Create your first workspace",
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

const Example: Story = {
  args: {
    description: "It is easy, just click the button below",
    cta: <Button>创建工作区</Button>,
  },
};

export { Example as EmptyState };
