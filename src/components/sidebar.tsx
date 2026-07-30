"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, KanbanSquare, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/kontakte", label: "Kontakte", icon: Users },
  { href: "/deals", label: "Deals", icon: KanbanSquare },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-6">
        <Image
          src="/logo_compass.png"
          alt="Naviga"
          width={40}
          height={40}
          className="shrink-0"
        />
        <div className="leading-tight">
          <div className="text-lg font-semibold tracking-[0.18em]">NAVIGA</div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/60">
            Treuhänder-CRM
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="truncate px-3 pb-2 text-xs text-sidebar-foreground/60">
          {userEmail}
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4.5" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
