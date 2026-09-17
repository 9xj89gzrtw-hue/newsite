import type { Metadata } from "next";

/**
 * c95 (Task 1-b) — роут /admin (статический экспорт → out/admin.html,
 * DirectorySlash в корневом .htaccess отдаёт его и на /admin).
 *
 * Разметка серверная только ради metadata (robots noindex/nofollow —
 * панель не должна попадать в индекс), сама страница — клиентская.
 */
export const metadata: Metadata = {
  title: { absolute: "Админ-панель — nilov catering" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
