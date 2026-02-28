import { Table } from "@radix-ui/themes";
import "./TableSkeleton.css";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  /** Show avatar placeholder in first column */
  showAvatar?: boolean;
}

export function TableSkeleton({
  rows = 10,
  columns = 3,
  showAvatar = false,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIdx) => (
        <Table.Row key={rowIdx}>
          {Array.from({ length: columns }, (_, colIdx) => (
            <Table.Cell key={colIdx}>
              <div className="skeleton-cell">
                {showAvatar && colIdx === 0 && (
                  <div className="skeleton-avatar" />
                )}
                <div
                  className="skeleton-text"
                  style={{
                    // Vary widths for visual interest
                    width: `${50 + ((rowIdx * 37 + colIdx * 53) % 40)}%`,
                  }}
                />
              </div>
            </Table.Cell>
          ))}
          {/* Empty cell for the action column */}
          {showAvatar && <Table.Cell />}
        </Table.Row>
      ))}
    </>
  );
}
