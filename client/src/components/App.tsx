import { useState, useCallback } from "react";
import { Theme, Container } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabLayout } from "./TabLayout";
import { useQueryParams } from "../hooks/useQueryParams";
import type { AppQueryParams } from "../types";

import "@radix-ui/themes/styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus during development — less noise
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  const { t } = useTranslation();
  const [initialParams] = useQueryParams();
  const [params, setParams] = useState<AppQueryParams>(initialParams);
  const [appearance, setAppearance] = useState<"light" | "dark">("light");

  const handleParamsChange = useCallback((next: Partial<AppQueryParams>) => {
    setParams((prev) => {
      const merged = { ...prev, ...next };

      // Sync to URL
      const urlParams = new URLSearchParams();
      if (merged.tab !== "users") urlParams.set("tab", merged.tab);
      if (merged.page > 1) urlParams.set("page", String(merged.page));
      if (merged.search) urlParams.set("search", merged.search);

      const qs = urlParams.toString();
      const url = qs
        ? `${window.location.pathname}?${qs}`
        : window.location.pathname;
      window.history.replaceState(null, "", url);

      return merged;
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <title>UsrMgr</title>
      <Theme
        appearance={appearance}
        accentColor="iris"
        grayColor="slate"
        radius="medium"
        scaling="100%"
      >
        <Container as="main" aria-label={t("app.mainLabel")} size="4" px="4" py="6">
          <TabLayout
            params={params}
            onParamsChange={handleParamsChange}
            appearance={appearance}
            onToggleTheme={() =>
              setAppearance((a) => (a === "light" ? "dark" : "light"))
            }
          />
        </Container>
      </Theme>
    </QueryClientProvider>
  );
}
