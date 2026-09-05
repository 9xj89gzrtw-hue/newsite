"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

/**
 * Toaster (sonner) — глобальный контейнер уведомлений.
 *
 * 81-W2F1 (критик F MEDIUM, тост поверх кнопок cookie-баннера):
 * мобильная позиция переведена в ВЕРХнюю треть (top-center). Раньше на
 * 390×844 success-тост (301×39, y 772-811) ложился ровно на кнопки
 * cookie-баннера (y 771-815) и на phone-FAB (right-6) — иконка «✕» тоста
 * перекрывала зону тапа. Top-center не пересекает ни баннер (теперь и
 * поднятый на bottom-100px), ни нижние док-элементы (FAB / sticky-bar
 * калькулятора / BackToTop). Отступ сверху — 72px: ниже залипающего
 * мобильного хедера (~68px с бордером), тост не прячет навигацию.
 * Десктоп НЕ тронут: прежний bottom-right, дефолтный отступ.
 *
 * Позиция вычисляется на клиенте (matchMedia <768px): контейнер пуст в
 * SSR/до гидрации — визуального рассинхрона нет, тосты появляются только
 * после пользовательских действий.
 */
function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`)
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [breakpointPx])
  return isMobile
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      containerAriaLabel="Уведомления"
      hotkey={[]}
      position={isMobile ? "top-center" : "bottom-right"}
      /* 81-W2F1: мобильный отступ — 72px сверху (ниже залипающего хедера
         ~68px); desktop-`offset` не влияет на мобильную раскладку — для
         <768 работает ТОЛЬКО mobileOffset (sonner: --mobile-offset-*). */
      mobileOffset={isMobile ? { top: "72px" } : undefined}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
