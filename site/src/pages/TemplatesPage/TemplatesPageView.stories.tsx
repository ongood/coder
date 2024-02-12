import type { Meta, StoryObj } from "@storybook/react";
import { chromaticWithTablet } from "testHelpers/chromatic";
import {
  mockApiError,
  MockTemplate,
  MockTemplateExample,
  MockTemplateExample2,
} from "testHelpers/entities";
import { TemplatesPageView } from "./TemplatesPageView";

const meta: Meta<typeof TemplatesPageView> = {
  title: "pages/TemplatesPage",
  parameters: { chromatic: chromaticWithTablet },
  component: TemplatesPageView,
};

export default meta;
type Story = StoryObj<typeof TemplatesPageView>;

export const WithTemplates: Story = {
  args: {
    canCreateTemplates: true,
    error: undefined,
    templates: [
      MockTemplate,
      {
        ...MockTemplate,
        active_user_count: -1,
        description: "🚀 一些没有活动数据的新模板",
        icon: "/icon/goland.svg",
      },
      {
        ...MockTemplate,
        active_user_count: 150,
        description: "😮 哇，这个模板使用率很高！",
        icon: "",
      },
      {
        ...MockTemplate,
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ",
      },
      {
        ...MockTemplate,
        name: "template-without-icon",
        display_name: "No Icon",
        description: "This one has no icon",
        icon: "",
      },
      {
        ...MockTemplate,
        name: "template-without-icon-deprecated",
        display_name: "Deprecated No Icon",
        description: "This one has no icon and is deprecated",
        deprecated: true,
        deprecation_message: "This template is so old, it's deprecated",
        icon: "",
      },
      {
        ...MockTemplate,
        name: "deprecated-template",
        display_name: "Deprecated",
        description: "Template is incompatible",
      },
    ],
    examples: [],
  },
};

export const EmptyCanCreate: Story = {
  args: {
    canCreateTemplates: true,
    error: undefined,
    templates: [],
    examples: [MockTemplateExample, MockTemplateExample2],
  },
};

export const EmptyCannotCreate: Story = {
  args: {
    error: undefined,
    templates: [],
    examples: [MockTemplateExample, MockTemplateExample2],
    canCreateTemplates: false,
  },
};

export const Error: Story = {
  args: {
    error: mockApiError({
      message: "Something went wrong fetching templates.",
    }),
    templates: undefined,
    examples: undefined,
    canCreateTemplates: false,
  },
};
