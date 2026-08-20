/**
 * In-memory lead store — persists leads within the server process lifetime.
 *
 * Used as a fallback when Prisma DB is not connected (no DATABASE_URL on Vercel).
 * Each lead gets a real sequential id (no "fallback" flag leaked to client).
 *
 * NOTE: This is volatile — resets when the serverless function cold-starts.
 * For production, connect a real Postgres DB (see .env.example).
 */

type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  eventType: string | null;
  guests: number | null;
  budget: number | null;
  message: string | null;
  consentAccepted: boolean;
  consentDate: Date;
  consentIp: string | null;
  userAgent: string | null;
  createdAt: Date;
};

const globalForLeads = globalThis as unknown as {
  __leadStore: Lead[] | undefined;
  __leadSeq: number | undefined;
};

const store: Lead[] = globalForLeads.__leadStore ?? [];
let seq: number = globalForLeads.__leadSeq ?? 1;

if (process.env.NODE_ENV !== "production") {
  globalForLeads.__leadStore = store;
  globalForLeads.__leadSeq = seq;
}

export const memoryLeadStore = {
  create(data: Omit<Lead, "id" | "createdAt">): Lead {
    const lead: Lead = {
      ...data,
      id: seq++,
      createdAt: new Date(),
    };
    store.push(lead);
    if (process.env.NODE_ENV !== "production") {
      globalForLeads.__leadSeq = seq;
    }
    return lead;
  },
  count(): number {
    return store.length;
  },
};
