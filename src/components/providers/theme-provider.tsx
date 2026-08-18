"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

/**
 * Light/dark theme provider. Mounted in the root layout.
 * Default theme = "light" (warm cream catering palette reads best in light).
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
