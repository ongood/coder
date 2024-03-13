import capitalize from "lodash/capitalize";
import type { FC } from "react";
import { AuditActions, ResourceTypes } from "api/typesGenerated";
import {
  Filter,
  FilterMenu,
  MenuSkeleton,
  OptionItem,
  SearchFieldSkeleton,
  type useFilter,
} from "components/Filter/filter";
import {
  useFilterMenu,
  type UseFilterMenuOptions,
} from "components/Filter/menu";
import type { BaseOption } from "components/Filter/options";
import { type UserFilterMenu, UserMenu } from "components/Filter/UserFilter";
import { docs } from "utils/docs";

const PRESET_FILTERS = [
  {
    query: "resource_type:workspace action:create",
    name: "已创建的工作区",
  },
  { query: "resource_type:template action:create", name: "已添加的模板" },
  { query: "resource_type:user action:delete", name: "已删除的用户" },
  {
    query: "resource_type:workspace_build action:start build_reason:initiator",
    name: "由用户发起的构建",
  },
  {
    query: "resource_type:api_key action:login",
    name: "用户登录记录",
  },
];

interface AuditFilterProps {
  filter: ReturnType<typeof useFilter>;
  error?: unknown;
  menus: {
    user: UserFilterMenu;
    action: ActionFilterMenu;
    resourceType: ResourceTypeFilterMenu;
  };
}

export const AuditFilter: FC<AuditFilterProps> = ({ filter, error, menus }) => {
  return (
    <Filter
      learnMoreLink={docs("/admin/audit-logs#filtering-logs")}
      presets={PRESET_FILTERS}
      isLoading={menus.user.isInitializing}
      filter={filter}
      error={error}
      options={
        <>
          <ResourceTypeMenu {...menus.resourceType} />
          <ActionMenu {...menus.action} />
          <UserMenu menu={menus.user} />
        </>
      }
      skeleton={
        <>
          <SearchFieldSkeleton />
          <MenuSkeleton />
          <MenuSkeleton />
          <MenuSkeleton />
        </>
      }
    />
  );
};

export const useActionFilterMenu = ({
  value,
  onChange,
}: Pick<UseFilterMenuOptions<BaseOption>, "value" | "onChange">) => {
  const actionOptions: BaseOption[] = AuditActions.map((action) => ({
    value: action,
    label: capitalize(action),
  }));
  return useFilterMenu({
    onChange,
    value,
    id: "status",
    getSelectedOption: async () =>
      actionOptions.find((option) => option.value === value) ?? null,
    getOptions: async () => actionOptions,
  });
};

export type ActionFilterMenu = ReturnType<typeof useActionFilterMenu>;

const ActionMenu = (menu: ActionFilterMenu) => {
  return (
    <FilterMenu
      id="action-menu"
      menu={menu}
      label={
        menu.selectedOption ? (
          <OptionItem option={menu.selectedOption} />
        ) : (
          "所有动作"
        )
      }
    >
      {(itemProps) => <OptionItem {...itemProps} />}
    </FilterMenu>
  );
};

export const useResourceTypeFilterMenu = ({
  value,
  onChange,
}: Pick<UseFilterMenuOptions<BaseOption>, "value" | "onChange">) => {
  const actionOptions: BaseOption[] = ResourceTypes.map((type) => {
    let label = capitalize(type);

    if (type === "api_key") {
      label = "API Key";
    }

    if (type === "git_ssh_key") {
      label = "Git SSH Key";
    }

    if (type === "template_version") {
      label = "Template Version";
    }

    if (type === "workspace_build") {
      label = "Workspace Build";
    }

    return {
      value: type,
      label,
    };
  });
  return useFilterMenu({
    onChange,
    value,
    id: "resourceType",
    getSelectedOption: async () =>
      actionOptions.find((option) => option.value === value) ?? null,
    getOptions: async () => actionOptions,
  });
};

export type ResourceTypeFilterMenu = ReturnType<
  typeof useResourceTypeFilterMenu
>;

const ResourceTypeMenu = (menu: ResourceTypeFilterMenu) => {
  return (
    <FilterMenu
      id="resource-type-menu"
      menu={menu}
      label={
        menu.selectedOption ? (
          <OptionItem option={menu.selectedOption} />
        ) : (
          "所有资源类型"
        )
      }
    >
      {(itemProps) => <OptionItem {...itemProps} />}
    </FilterMenu>
  );
};
