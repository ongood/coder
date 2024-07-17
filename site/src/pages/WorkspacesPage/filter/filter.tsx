import type { FC } from "react";
import {
  Filter,
  MenuSkeleton,
  SearchFieldSkeleton,
  type useFilter,
} from "components/Filter/filter";
import { type UserFilterMenu, UserMenu } from "components/Filter/UserFilter";
import { useDashboard } from "modules/dashboard/useDashboard";
import { docs } from "utils/docs";
import {
  TemplateMenu,
  StatusMenu,
  type TemplateFilterMenu,
  type StatusFilterMenu,
} from "./menus";

export const workspaceFilterQuery = {
  me: "owner:me",
  all: "",
  running: "status:running",
  failed: "status:failed",
  dormant: "dormant:true",
  outdated: "outdated:true",
};

type FilterPreset = {
  query: string;
  name: string;
};

// Can't use as const declarations to make arrays deep readonly because that
// interferes with the type contracts for Filter
const PRESET_FILTERS: FilterPreset[] = [
  {
    query: workspaceFilterQuery.me,
    name: "我的工作区",
  },
  {
    query: workspaceFilterQuery.all,
    name: "所有工作区",
  },
  {
    query: workspaceFilterQuery.running,
    name: "运行中的工作区",
  },
  {
    query: workspaceFilterQuery.failed,
    name: "失败的工作区",
  },
  {
    query: workspaceFilterQuery.outdated,
    name: "过期的工作区",
  },
];

// Defined outside component so that the array doesn't get reconstructed each render
const PRESETS_WITH_DORMANT: FilterPreset[] = [
  ...PRESET_FILTERS,
  {
    query: workspaceFilterQuery.dormant,
    name: "休眠的工作区",
  },
];

type WorkspaceFilterProps = {
  filter: ReturnType<typeof useFilter>;
  error?: unknown;
  menus: {
    user?: UserFilterMenu;
    template: TemplateFilterMenu;
    status: StatusFilterMenu;
  };
};

export const WorkspacesFilter: FC<WorkspaceFilterProps> = ({
  filter,
  error,
  menus,
}) => {
  const { entitlements } = useDashboard();
  const presets = entitlements.features["advanced_template_scheduling"].enabled
    ? PRESETS_WITH_DORMANT
    : PRESET_FILTERS;

  return (
    <Filter
      presets={presets}
      isLoading={menus.status.isInitializing}
      filter={filter}
      error={error}
      learnMoreLink={docs("/workspaces#workspace-filtering")}
      options={
        <>
          {menus.user && <UserMenu menu={menus.user} />}
          <TemplateMenu {...menus.template} />
          <StatusMenu {...menus.status} />
        </>
      }
      skeleton={
        <>
          <SearchFieldSkeleton />
          {menus.user && <MenuSkeleton />}
          <MenuSkeleton />
          <MenuSkeleton />
        </>
      }
    />
  );
};
