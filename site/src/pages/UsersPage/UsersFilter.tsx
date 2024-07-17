import type { FC } from "react";
import {
  Filter,
  MenuSkeleton,
  SearchFieldSkeleton,
  type useFilter,
} from "components/Filter/filter";
import {
  type UseFilterMenuOptions,
  useFilterMenu,
} from "components/Filter/menu";
import {
  SelectFilter,
  type SelectFilterOption,
} from "components/Filter/SelectFilter";
import { StatusIndicator } from "components/StatusIndicator/StatusIndicator";
import { docs } from "utils/docs";

const userFilterQuery = {
  active: "status:active",
  all: "",
};

export const useStatusFilterMenu = ({
  value,
  onChange,
}: Pick<UseFilterMenuOptions<SelectFilterOption>, "value" | "onChange">) => {
  const statusOptions: SelectFilterOption[] = [
    {
      value: "active",
      label: "活跃",
      startIcon: <StatusIndicator color="success" />,
    },
    {
      value: "dormant",
      label: "休眠",
      startIcon: <StatusIndicator color="notice" />,
    },
    {
      value: "suspended",
      label: "已暂停",
      startIcon: <StatusIndicator color="warning" />,
    },
  ];
  return useFilterMenu({
    onChange,
    value,
    id: "status",
    getSelectedOption: async () =>
      statusOptions.find((option) => option.value === value) ?? null,
    getOptions: async () => statusOptions,
  });
};

export type StatusFilterMenu = ReturnType<typeof useStatusFilterMenu>;

const PRESET_FILTERS = [
  { query: userFilterQuery.active, name: "活跃用户" },
  { query: userFilterQuery.all, name: "所有用户" },
];

interface UsersFilterProps {
  filter: ReturnType<typeof useFilter>;
  error?: unknown;
  menus: {
    status: StatusFilterMenu;
  };
}

export const UsersFilter: FC<UsersFilterProps> = ({ filter, error, menus }) => {
  return (
    <Filter
      presets={PRESET_FILTERS}
      learnMoreLink={docs("/admin/users#user-filtering")}
      learnMoreLabel2="用户状态"
      learnMoreLink2={docs("/admin/users#user-status")}
      isLoading={menus.status.isInitializing}
      filter={filter}
      error={error}
      options={<StatusMenu {...menus.status} />}
      skeleton={
        <>
          <SearchFieldSkeleton />
          <MenuSkeleton />
        </>
      }
    />
  );
};

const StatusMenu = (menu: StatusFilterMenu) => {
  return (
    <SelectFilter
      label="选择一个状态"
      placeholder="所有状态"
      options={menu.searchOptions}
      onSelect={menu.selectOption}
      selectedOption={menu.selectedOption ?? undefined}
    />
  );
};
