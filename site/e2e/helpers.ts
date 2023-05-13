import { Page } from "@playwright/test"
import path from "path"

export const buttons = {
  starterTemplates: "入门模板",
  dockerTemplate: "在 Docker 中开发",
  useTemplate: "使用模板",
  createTemplate: "创建模板",
  createWorkspace: "创建工作区",
  submitCreateWorkspace: "创建工作区",
  stopWorkspace: "停止",
  startWorkspace: "启动",
}

export const clickButton = async (page: Page, name: string): Promise<void> => {
  await page.getByRole("button", { name, exact: true }).click()
}

export const fillInput = async (
  page: Page,
  label: string,
  value: string,
): Promise<void> => {
  await page.fill(`text=${label}`, value)
}

const statesDir = path.join(__dirname, "./states")

export const getStatePath = (name: string): string => {
  return path.join(statesDir, `${name}.json`)
}
