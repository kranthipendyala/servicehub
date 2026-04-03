/**
 * Server-safe fetch wrapper that bypasses Cloudflare challenges.
 * Used by all server-side API calls. Adds browser-like headers
 * and retries once on failure.
 */

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function serverFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  // Always set browser-like headers to bypass Cloudflare
  if (!headers.has("User-Agent")) headers.set("User-Agent", BROWSER_UA);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Accept-Language")) headers.set("Accept-Language", "en-US,en;q=0.9");
  if (!headers.has("Accept-Encoding")) headers.set("Accept-Encoding", "gzip, deflate, br");
  headers.set("Sec-Fetch-Dest", "empty");
  headers.set("Sec-Fetch-Mode", "cors");
  headers.set("Sec-Fetch-Site", "cross-site");

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Check if Cloudflare returned an HTML challenge instead of JSON
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html") && !url.includes(".html")) {
      // Cloudflare challenge detected — retry once
      const retryResponse = await fetch(url, {
        ...fetchOptions,
        cache: "no-store",
      });
      return retryResponse;
    }

    return response;
  } catch (error) {
    // Retry once on network error
    try {
      return await fetch(url, { ...fetchOptions, cache: "no-store" });
    } catch {
      throw error;
    }
  }
}
