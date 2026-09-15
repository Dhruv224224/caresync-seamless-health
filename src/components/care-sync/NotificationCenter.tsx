import React from "react";
import {
  Bell,
  Check,
  Stethoscope,
  FlaskConical,
  Pill,
  Activity,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCareSync } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

export function NotificationCenter() {
  const { notifications, markNotificationRead } = useCareSync();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <FlaskConical className="size-4 text-warn" />;
      case "prescription":
        return <Pill className="size-4 text-brand" />;
      case "result":
        return <Check className="size-4 text-calm" />;
      case "surgery":
        return <Activity className="size-4 text-crit" />;
      default:
        return <Bell className="size-4 text-ink/60" />;
    }
  };

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationRead(notif.id);
    if (notif.patientId) {
      navigate({ to: "/doctor/patient/$id", params: { id: notif.patientId } });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-ink/70 hover:text-ink">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white shadow-sm ring-2 ring-card animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 p-0 shadow-2xl border-border bg-card"
      >
        <div className="flex items-center justify-between p-3.5 border-b border-border bg-surf/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-ink">Hospital Feed</span>
            {unreadCount > 0 && (
              <Badge className="bg-brand/15 text-brand text-[10px] font-mono hover:bg-brand/20">
                {unreadCount} New
              </Badge>
            )}
          </div>
          <span className="text-[11px] font-mono text-ink/40">Real-time alerts</span>
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/50">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/40">No notifications yet</div>
          ) : (
            notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                  notif.read
                    ? "opacity-70 hover:opacity-100 bg-transparent"
                    : "bg-brand/5 font-medium"
                }`}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-surf border border-border/80 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-ink truncate">{notif.title}</span>
                    <span className="text-[10px] font-mono text-ink/40 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-ink/70 mt-1 leading-snug line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        <div className="p-2.5 border-t border-border bg-surf/30 text-center">
          <span className="text-[11px] font-mono text-ink/50">Cross-department sync active</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
