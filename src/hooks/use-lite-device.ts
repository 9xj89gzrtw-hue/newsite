"use client";

import { useEffect, useState } from "react";
import { isDataSaverLite, isLiteDevice, subscribeLiteDevice } from "@/lib/lite-device";

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

/**
 * c98-FIX1 (критик1 #3, MINOR): useDataSaverLite — реактивная трафик-ветка
 * детектора для tott-hero. Проблема: isDataSaverLite() живой (без кэша),
 * но БЕЗ состояния — deps эффекта hero [reduce, lite] не видят флип Data
 * Saver ПОСЛЕ уже установленного lite: useLiteDevice при lite===true
 * молчит (setLite(true) на том же значении — React bailout), ререндера и
 * перезапуска эффекта нет → уже играющее видео не гасится в постер.
 * Хук: значение после маунта + подписка на subscribeLiteDevice (тот
 * уведомляет и при дельте dataSaver-фактора на уже-lite-девайсе,
 * см. becomeLite). Гидро-паритет: SSR/первый рендер — false.
 */
export function useDataSaverLite(): boolean {
  const [dataSaver, setDataSaver] = useState(false);

  useEffect(() => {
    setDataSaver(isDataSaverLite());
    return subscribeLiteDevice(() => setDataSaver(isDataSaverLite()));
  }, []);

  return dataSaver;
}
