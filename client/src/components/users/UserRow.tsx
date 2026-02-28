import { Avatar, Table, Text } from "@radix-ui/themes";
import { UserActionMenu } from "./UserActionMenu";
import type { User, Role } from "../../types";

interface UserRowProps {
  user: User;
  role: Role | undefined;
}

/** Format ISO date string to locale-aware display like "Aug 27, 2024" */
function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** Get initials for avatar fallback */
function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function UserRow({ user, role }: UserRowProps) {
  const fullName = `${user.first} ${user.last}`;

  return (
    <Table.Row>
      <Table.Cell>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size="3"
            src={user.photo}
            fallback={getInitials(user.first, user.last)}
            radius="full"
          />
          <Text weight="medium">{fullName}</Text>
        </div>
      </Table.Cell>
      <Table.Cell>
        <Text color="gray">{role?.name ?? "—"}</Text>
      </Table.Cell>
      <Table.Cell>
        <Text color="gray">{formatDate(user.createdAt)}</Text>
      </Table.Cell>
      <Table.Cell>
        <UserActionMenu user={user} />
      </Table.Cell>
    </Table.Row>
  );
}
