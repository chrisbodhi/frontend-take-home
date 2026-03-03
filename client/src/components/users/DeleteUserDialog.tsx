import { AlertDialog, Button, Flex, Text } from "@radix-ui/themes";
import { useTranslation, Trans } from "react-i18next";
import type { User } from "../../types";

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAfterDelete: () => void;
  onDeferredDelete: (userId: string, userName: string) => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onAfterDelete,
  onDeferredDelete,
}: DeleteUserDialogProps) {
  const { t } = useTranslation();
  const fullName = `${user.first} ${user.last}`;

  function handleDelete() {
    onDeferredDelete(user.id, fullName);
    onAfterDelete();
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
          <Button color="red" variant="surface" onClick={handleDelete}>
            {t("users.deleteConfirmButton")}
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
