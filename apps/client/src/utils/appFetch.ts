import { SERVER_BASE_URL } from "./consts";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface AppFetchOptions<TBody = unknown> {
  url: string;
  method?: HttpMethod;
  queries?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  body?: TBody;
}

export interface AppFetchResponse<TData> {
  data: TData;
  status: number;
  headers: Headers;
}

export async function appFetch<TResponse = unknown, TBody = unknown>(
  options: AppFetchOptions<TBody>,
): Promise<AppFetchResponse<TResponse>> {
  const { url, method = "GET", queries, headers = {}, body } = options;

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

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  const requestBody = body !== undefined ? JSON.stringify(body) : undefined;

  const response = await fetch(requestUrl.toString(), {
    method,
    headers: requestHeaders,
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data =
    response.status === 204 ? (null as TResponse) : await response.json();

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}
