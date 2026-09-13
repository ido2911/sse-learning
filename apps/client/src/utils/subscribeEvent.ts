import { SERVER_BASE_URL } from "./consts";

export interface SSEOptions<TNotification = unknown> {
  url: string;
  queries?: Record<string, string | number | boolean | null | undefined>;
  onEvent: (data: TNotification) => void;
  onError?: (error: Event) => void;
  withCredentials?: boolean;
}

export function subscribeEvent<TData = unknown>(
  options: SSEOptions<TData>,
): () => void {
  const { url, queries, onEvent, onError, withCredentials } = options;

  // 1. Build URL with query params
  const requestUrl = new URL(url, SERVER_BASE_URL);

  if (queries) {
    const searchParams = new URLSearchParams();
    Object.entries(queries).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    requestUrl.search = searchParams.toString();
  }

  // 2. Open EventSource connection (Browser handles SSE framing & auto-reconnect)
  const eventSource = new EventSource(requestUrl.toString(), {
    withCredentials,
  });

  eventSource.onmessage = (event: MessageEvent) => {
    onEvent(JSON.parse(event.data));
  };

  if (onError) {
    eventSource.onerror = onError;
  }

  return () => {
    eventSource.close();
  };
}
