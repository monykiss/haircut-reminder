export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/clients/:path*", "/api/sms-logs/:path*"],
};
