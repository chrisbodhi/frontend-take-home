import { useState, useRef, useEffect } from "react";
import { Flex, IconButton, Text, TextField } from "@radix-ui/themes";
import { Check, X, Pencil } from "lucide-react";
import { useRenameRole } from "../../api/roles";
import { ApiClientError } from "../../api/client";

interface RoleNameEditorProps {
  roleId: string;
  currentName: string;
}

export function RoleNameEditor({ roleId, currentName }: RoleNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameRole = useRenameRole();

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setValue(currentName);
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setValue(currentName);
    setError(null);
  }

  function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === currentName) {
      cancel();
      return;
    }

    renameRole.mutate(
      { roleId, name: trimmed },
      {
        onSuccess: () => {
          setEditing(false);
          setError(null);
        },
        onError: (err) => {
          if (err instanceof ApiClientError) {
            setError(err.message);
          } else {
            setError("Failed to rename role.");
          }
        },
      },
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  }

  if (!editing) {
    return (
      <Flex align="center" gap="2" className="role-name-display">
        <Text weight="medium">{currentName}</Text>
        <IconButton
          variant="ghost"
          color="gray"
          size="1"
          onClick={startEditing}
          aria-label={`Rename ${currentName}`}
          className="role-edit-button"
        >
          <Pencil size={14} />
        </IconButton>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="1">
      <Flex align="center" gap="1">
        <TextField.Root
          ref={inputRef}
          size="2"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={renameRole.isPending}
          style={{ minWidth: 180 }}
        />
        <IconButton
          variant="soft"
          color="green"
          size="1"
          onClick={save}
          disabled={renameRole.isPending}
          aria-label="Save"
        >
          <Check size={14} />
        </IconButton>
        <IconButton
          variant="soft"
          color="gray"
          size="1"
          onClick={cancel}
          disabled={renameRole.isPending}
          aria-label="Cancel"
        >
          <X size={14} />
        </IconButton>
      </Flex>
      {error && (
        <Text color="red" size="1">
          {error}
        </Text>
      )}
    </Flex>
  );
}
