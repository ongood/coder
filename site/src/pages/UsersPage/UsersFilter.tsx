import { useTheme } from "@emotion/react";
import type { FC } from "react";
import {
  Filter,
  FilterMenu,
  MenuSkeleton,
  OptionItem,
  SearchFieldSkeleton,
  type useFilter,
} from "components/Filter/filter";
import {
  type UseFilterMenuOptions,
  useFilterMenu,
} from "components/Filter/menu";
import type { BaseOption } from "components/Filter/options";
import type { ThemeRole } from "theme/roles";
import { docs } from "utils/docs";

const userFilterQuery = {
  active: "status:active",
  all: "",
};

type StatusOption = BaseOption & {
  color: ThemeRole;
};

export const useStatusFilterMenu = ({
  value,
  onChange,
}: Pick<UseFilterMenuOptions<StatusOption>, "value" | "onChange">) => {
  const statusOptions: StatusOption[] = [
    { value: "active", label: "活跃", color: "success" },
    { value: "dormant", label: "休眠", color: "notice" },
    { value: "suspended", label: "已暂停", color: "warning" },
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
    <FilterMenu
      id="status-menu"
      menu={menu}
      label={
        menu.selectedOption ? (
          <StatusOptionItem option={menu.selectedOption} />
        ) : (
          "所有状态"
        )
      }
    >
      {(itemProps) => <StatusOptionItem {...itemProps} />}
    </FilterMenu>
  );
};

interface StatusOptionItemProps {
  option: StatusOption;
  isSelected?: boolean;
}

const StatusOptionItem: FC<StatusOptionItemProps> = ({
  option,
  isSelected,
}) => {
  return (
    <OptionItem
      option={option}
      left={<StatusIndicator option={option} />}
      isSelected={isSelected}
    />
  );
};

interface StatusIndicatorProps {
  option: StatusOption;
}

const StatusIndicator: FC<StatusIndicatorProps> = ({ option }) => {
  const theme = useTheme();

  return (
    <div
      css={{
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: theme.roles[option.color].fill.solid,
      }}
    />
  );
};
