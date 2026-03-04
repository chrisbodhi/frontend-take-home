import { Component, type ReactNode, type ErrorInfo } from "react";
import { Box, Button, Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { ApiClientError } from "../../api/client";

interface Props {
  children: ReactNode;
  /** Called when the user resets the boundary — use to reset React Query's error state via QueryErrorResetBoundary */
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time JavaScript errors anywhere in the subtree.
 * Async/network errors are handled by React Query and surfaced via ErrorBanner.
 *
 * Class component is required — React error boundaries cannot be function components.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, forward to your error reporting service, e.g.:
    // Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    console.error("[ErrorBoundary] Unhandled render error:", error, {
      componentStack: info.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) {
  // Distinguish API errors (known, recoverable) from unexpected JS crashes
  const isApiError = error instanceof ApiClientError;
  const isClientError = isApiError && error.status >= 400 && error.status < 500;
  const color = isClientError ? "amber" : "red";

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py="9"
      style={{ minHeight: "50vh" }}
    >
      <Callout.Root
        color={color}
        role="alert"
        aria-live="assertive"
        style={{ maxWidth: 480, width: "100%" }}
      >
        <Callout.Icon>
          <ExclamationTriangleIcon width={18} height={18} />
        </Callout.Icon>
        <Box>
          <Heading as="h2" size="4" mb="2">
            Something went wrong
          </Heading>
          <Text as="p" mb="3">
            {error.message || "An unexpected error occurred."}
          </Text>
          {/* Show stack trace in development to speed up debugging */}
          {import.meta.env.DEV && error.stack && (
            <Text
              as="p"
              size="1"
              mb="3"
              style={{
                fontFamily: "monospace",
                opacity: 0.65,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {error.stack}
            </Text>
          )}
          <Flex gap="2">
            <Button color={color} variant="solid" onClick={onReset}>
              <ReloadIcon />
              Try again
            </Button>
            <Button
              color={color}
              variant="soft"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </Flex>
        </Box>
      </Callout.Root>
    </Flex>
  );
}
