import { Tabs } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";
import { UsersPanel } from "./users/UsersPanel";
import { RolesPanel } from "./roles/RolesPanel";
import type { AppQueryParams } from "../types";

interface TabLayoutProps {
  params: AppQueryParams;
  onParamsChange: (next: Partial<AppQueryParams>) => void;
}

export function TabLayout({ params, onParamsChange }: TabLayoutProps) {
  const { t } = useTranslation();

  function handleTabChange(value: string) {
    // Reset page and search when switching tabs
    onParamsChange({
      tab: value as AppQueryParams["tab"],
      page: 1,
      search: "",
    });
  }

  return (
    <Tabs.Root value={params.tab} onValueChange={handleTabChange}>
      <Tabs.List>
        <Tabs.Trigger value="users">{t("tabs.users")}</Tabs.Trigger>
        <Tabs.Trigger value="roles">{t("tabs.roles")}</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="users" style={{ paddingTop: 24 }}>
        <title>{`UsrMgr | ${t("tabs.users")}`}</title>
        <UsersPanel
          page={params.tab === "users" ? params.page : 1}
          search={params.tab === "users" ? params.search : ""}
          onPageChange={(page) => onParamsChange({ page })}
          onSearchChange={(search) => onParamsChange({ search })}
        />
      </Tabs.Content>

      <Tabs.Content value="roles" style={{ paddingTop: 24 }}>
        <title>{`UsrMgr | ${t("tabs.roles")}`}</title>
        <RolesPanel
          page={params.tab === "roles" ? params.page : 1}
          search={params.tab === "roles" ? params.search : ""}
          onPageChange={(page) => onParamsChange({ page })}
          onSearchChange={(search) => onParamsChange({ search })}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
