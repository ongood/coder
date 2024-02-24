import {
  MockAuthMethodsAll,
  MockAuthMethodsExternal,
  MockAuthMethodsPasswordOnly,
  mockApiError,
} from "testHelpers/entities";
import { LoginPageView } from "./LoginPageView";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof LoginPageView> = {
  title: "pages/LoginPage",
  component: LoginPageView,
};

export default meta;
type Story = StoryObj<typeof LoginPageView>;

export const Example: Story = {
  args: {
    authMethods: MockAuthMethodsPasswordOnly,
  },
};

export const WithExternalAuthMethods: Story = {
  args: {
    authMethods: MockAuthMethodsExternal,
  },
};

export const WithAllAuthMethods: Story = {
  args: {
    authMethods: MockAuthMethodsAll,
  },
};

export const AuthError: Story = {
  args: {
    error: mockApiError({
      message: "电子邮件地址或密码错误。",
    }),
    authMethods: MockAuthMethodsPasswordOnly,
  },
};

export const ExternalAuthError: Story = {
  args: {
    error: mockApiError({
      message: "电子邮件地址或密码错误。",
    }),
    authMethods: MockAuthMethodsAll,
  },
};

export const LoadingAuthMethods: Story = {
  args: {
    authMethods: undefined,
  },
};

export const SigningIn: Story = {
  args: {
    isSigningIn: true,
    authMethods: MockAuthMethodsPasswordOnly,
  },
};
