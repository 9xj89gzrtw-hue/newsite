"use client";

import { useEffect } from "react";
import { resendPendingLeads } from "@/lib/submit-lead";

/**
 * LeadOutboxResender — c98-FIX2 (критик5 MINOR-5): микро-компонент
 * инициализации авто-резенда outbox заявок (submit-lead.ts →
 * resendPendingLeads(): таймер 1.5с + pagehide-beacon, guard-флаг на
 * window от двойной инициализации).
 *
 * Зачем: прежде авто-резенд был side-effect'ом импорта модуля
 * submit-lead.ts, а импортировали его только страницы с формами
 * (главная) — застрявшая в outbox заявка не доотправлялась, пока
 * пользователь не вернулся бы НА ГЛАВНУЮ. Этот компонент монтируется в
 * корневом layout (src/app/layout.tsx) — на ВСЕХ страницах
 * (/offer, /privacy, /terms…). На /admin резенд не работает
 * (isPublicPage()-гейт внутри submit-lead.ts).
 *
 * Рендерит null: только useEffect-инициализация, ноль разметки.
 */
export function LeadOutboxResender() {
  useEffect(() => {
    resendPendingLeads();
  }, []);
  return null;
}

export default LeadOutboxResender;
