import { AlertDialog, Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation, Trans } from "react-i18next";
import { useDeleteUser } from "../../api/users";
import type { User } from "../../types";

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAfterDelete: () => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onAfterDelete,
}: DeleteUserDialogProps) {
  const { t } = useTranslation();
  const deleteUser = useDeleteUser();
  const fullName = `${user.first} ${user.last}`;

  async function handleDelete() {
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        onAfterDelete();
      },
    });
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="480px">
        <AlertDialog.Title>{t("users.deleteConfirmTitle")}</AlertDialog.Title>
        <AlertDialog.Description>
          <Trans
            i18nKey="users.deleteConfirmMessage"
            values={{ name: fullName }}
            components={{ strong: <strong /> }}
          />
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="outline" color="gray">
              <Text weight="bold">{t("users.cancel")}</Text>
            </Button>
          </AlertDialog.Cancel>
          <Button
            color="red"
            variant="surface"
            onClick={handleDelete}
            disabled={deleteUser.isPending}
          >
            {deleteUser.isPending ? "…" : t("users.deleteConfirmButton")}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
