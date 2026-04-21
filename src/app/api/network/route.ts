import { NextRequest, NextResponse } from "next/server";

// 私有 IP 段正则
const PRIVATE_IP =
  /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|fc|fd|fe80)/;

export async function GET(req: NextRequest) {
  // 优先取反代透传的真实 IP
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";

  const isInternal = PRIVATE_IP.test(ip);

  return NextResponse.json({ ip, isInternal });
}
