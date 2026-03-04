import { DropdownMenu, Flex, IconButton } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import type { User } from "../../types";
import { ComingSoonTooltip } from "../shared/ComingSoonTooltip";

interface UserActionMenuProps {
  user: User;
  onDeleteRequest: (user: User) => void;
}

export function UserActionMenu({ user, onDeleteRequest }: UserActionMenuProps) {
  const { t } = useTranslation();
  const fullName = `${user.first} ${user.last}`;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          color="gray"
          size="2"
          radius="full"
          aria-label={t("users.userActionsLabel", { name: fullName })}
        >
          <DotsHorizontalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item>
          <ComingSoonTooltip>
            <Flex
              justify="between"
              align="center"
              gap="4"
              style={{ width: "100%" }}
            >
              <span>{t("users.editUser")}</span>
            </Flex>
          </ComingSoonTooltip>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onDeleteRequest(user)}>
          {t("users.deleteUser")}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
