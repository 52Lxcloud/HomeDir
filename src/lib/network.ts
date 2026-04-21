import { cookies } from "next/headers";

const COOKIE_NAME = "network-mode";

export async function getNetworkMode(): Promise<boolean> {
  const store = await cookies();
  const val = store.get(COOKIE_NAME)?.value;
  return val !== "external"; // 默认内网
}
