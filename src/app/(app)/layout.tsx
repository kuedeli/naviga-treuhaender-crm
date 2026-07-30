import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1">
      <Sidebar userEmail={user?.email ?? ""} />
      <main className="flex-1 overflow-x-auto p-6 lg:p-10">{children}</main>
    </div>
  );
}
