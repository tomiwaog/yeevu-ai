import { NextRequest } from "next/server";

export function isLocalhost(req: NextRequest): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') ||
             'unknown';
  return ip.includes('127.0.0.1') || ip.includes('::1') || ip === 'unknown';
}
