import { useState } from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { DeleteUserDialog } from "./DeleteUserDialog";
import type { User } from "../../types";

interface UserActionMenuProps {
  user: User;
}

export function UserActionMenu({ user }: UserActionMenuProps) {
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton
            variant="ghost"
            color="gray"
            size="2"
            aria-label="User actions"
          >
            <DotsHorizontalIcon />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item disabled>{t("users.editUser")}</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item color="red" onSelect={() => setDeleteOpen(true)}>
            {t("users.deleteUser")}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <DeleteUserDialog
        user={user}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
