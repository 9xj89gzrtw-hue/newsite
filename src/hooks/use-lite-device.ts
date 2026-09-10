"use client";

import { useEffect, useState } from "react";
import { isLiteDevice, subscribeLiteDevice } from "@/lib/lite-device";

/**
 * c84: useLiteDevice — React-хук поверх lib/lite-device.
 *
 * Гидро-паритет: SSR и первый рендер всегда видят false (полная версия),
 * реальный lite-детект применяется ПОСЛЕ монтирования через setState —
 * разметка до/после отличается только поведением (видео/канвас/Lenis),
 * текст и структура DOM не меняются → hydration mismatch исключён.
 *
 * Подписка: если на старте не lite, слушаем connection.change — включение
 * Data Saver по ходу сессии дёргает setLite(true) (односторонний
 * даунгрейд, см. lib/lite-device.ts).
 */
export function useLiteDevice(): boolean {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    if (isLiteDevice()) {
      setLite(true);
      return;
    }
    return subscribeLiteDevice(() => setLite(true));
  }, []);

  return lite;
}
