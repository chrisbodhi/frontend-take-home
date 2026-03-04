import { DropdownMenu, Flex, IconButton, Text } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import type { User } from "../../types";

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
        <DropdownMenu.Item disabled>
          <Flex
            justify="between"
            align="center"
            gap="4"
            style={{ width: "100%" }}
          >
            <span>{t("users.editUser")}</span>
            <Text size="1" color="gray">
              {t("comingSoon.label")}
            </Text>
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => onDeleteRequest(user)}>
          {t("users.deleteUser")}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
