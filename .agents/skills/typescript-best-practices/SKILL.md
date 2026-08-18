# TypeScript Best Practices Skill

> Рекомендации по написанию качественного TypeScript кода в проекте кейтеринговой компании.

## Когда использовать

- При создании новых компонентов и утилит
- При рефакторинге существующего кода
- При code review перед коммитом
- При интеграции новых библиотек

## Project Configuration

### tsconfig.json (текущий)

```jsonc
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,           // Всегда strict mode
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    },
    "noUncheckedIndexedAccess": true,  // Проверка индексов
    "exactOptionalPropertyTypes": true  // Точные optional типы
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Type Definitions

### Core Types (src/types/index.ts)

```typescript
// Базовые типы проекта
export type EventTypeId = 'banquet' | 'buffet' | 'coffee-break' | 'furshet' 
  | 'snack-box' | 'office-lunch' | 'vegetarian';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  pricePerPerson: number;
  categoryId: string;
  category: MenuCategory;
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: EventTypeId;
  description?: string;
  minGuests: number;
  basePrice: number;
}

export interface LeadPayload {
  name: string;
  phone: string;
  eventType: EventTypeId;
  guestCount?: number;
  eventDate?: string;
  message?: string;
}

export interface Testimonial {
  id: string;
  company: string;
  text: string;
  rating: number; // 1-5
  eventDate: string;
  eventType: string;
  image?: string;
}

// Generic API Response
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Component Props Patterns
export interface BaseComponentProps {
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}
```

### Utility Types

```typescript
// src/lib/types.ts
import { type } from 'os';

// Make specific keys required
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Make specific keys optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Non-nullable fields
type NonNullableFields<T> = { [K in keyof T]: NonNullable<T[K]> };

// Extract event type from union
type EventTypeString = EventTypeId;

// String literal from object keys
type ValueOf<T> = T[keyof T];

// Example usage:
type LeadWithRequiredFields = RequireFields<LeadPayload, 'name' | 'phone' | 'eventType'>;
```

## Component Typing Patterns

### Server Components

```tsx
// ✅ Правильно — async server component
interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

export default async function Hero({ title, subtitle, ctaText, ctaHref }: HeroProps) {
  // Можно использовать await для данных
  const featuredEvent = await getFeaturedEvent();
  
  return (
    <section className="relative">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <Link href={ctaHref}>{ctaText}</Link>
    </section>
  );
}
```

### Client Components with Hooks

```tsx
'use client';

// ✅ Правильно — разделение props и hook returns
interface CalculatorProps {
  initialType?: EventTypeId;
  onQuoteRequest?: (data: QuoteData) => void;
}

export function Calculator({ initialType = 'banquet', onQuoteRequest }: CalculatorProps) {
  // Хуки в начале компонента
  const [guests, setGuests] = useState<number>(20);
  const [selectedType, setSelectedType] = useState<EventTypeId>(initialType);
  
  // Производные значения через useMemo
  const subtotal = useMemo(
    () => calculateSubtotal(selectedType, guests),
    [selectedType, guests]
  );
  
  const seasonalMultiplier = useSeasonalMultiplier();
  const total = subtotal * seasonalMultiplier;
  
  // Обработчики событий
  const handleGuestsChange = useCallback((value: number) => {
    setGuests(Math.max(10, Math.min(500, value)));
  }, []);
  
  return (
    <form onSubmit={(e) => handleSubmit(e, { selectedType, guests, total })}>
      {/* ... */}
    </form>
  );
}
```

### Generic Components

```tsx
// ✅ Переиспользуемый generic компонент
interface AnimatedSectionProps<T extends HTMLElement = HTMLDivElement> {
  as?: React.ElementType;
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-in' | 'scale-up';
  delay?: number;
  className?: string;
}

export function AnimatedSection<T extends HTMLElement = HTMLDivElement>({
  as: Component = 'div',
  children,
  animation = 'fade-up',
  delay = 0,
  className,
}: AnimatedSectionProps<T>) {
  return (
    <MotionComponent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
```

## API Route Typing

```tsx
// app/api/lead/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, LeadPayload } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Lead>>> {
  try {
    // Валидация входных данных
    const body: unknown = await request.json();
    
    if (!isValidLeadPayload(body)) {
      return NextResponse.json(
        { data: null, error: 'Invalid payload', success: false },
        { status: 400 }
      );
    }
    
    const lead: LeadPayload = body;
    
    // Создание записи в БД
    const createdLead = await db.lead.create({ data: lead });
    
    return NextResponse.json(
      { data: createdLead, error: null, success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lead creation failed:', error);
    return NextResponse.json(
      { data: null, error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// Type guard для валидации
function isValidLeadPayload(payload: unknown): payload is LeadPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  
  const p = payload as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    p.name.length >= 2 &&
    typeof p.phone === 'string' &&
    /^\+?[\d\s()-]{10,}$/.test(p.phone) &&
    typeof p.eventType === 'string' &&
    ['banquet', 'buffet', 'coffee-break', 'furshet', 'snack-box', 'office-lunch', 'vegetarian'].includes(p.eventType)
  );
}
```

## Zod Schema Integration

```typescript
// src/lib/schemas.ts
import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, 'Имя минимум 2 символа').max(100),
  phone: z
    .string()
    .regex(/^\+?[\d\s()-]{10,11}$/, 'Некорректный номер телефона'),
  eventType: z.enum([
    'banquet',
    'buffet',
    'coffee-break',
    'furshet',
    'snack-box',
    'office-lunch',
    'vegetarian',
  ]),
  guestCount: z.coerce.number().int().min(10).max(500).optional(),
  eventDate: z.string().datetime().optional(),
  message: z.string().max(1000).optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;

// Использование в форме
const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
  resolver: zodResolver(leadSchema),
});
```

## Error Handling Patterns

```typescript
// ✅ Типизированная обработка ошибок
class ApplicationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

class ValidationError extends ApplicationError {
  constructor(public fields: Record<string, string[]>) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
  }
}

class DatabaseError extends ApplicationError {
  constructor(operation: string) {
    super(`Database operation failed: ${operation}`, 500, 'DATABASE_ERROR');
  }
}

// Safe execution wrapper
async function safeExecute<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { data, error: null, success: true };
  } catch (error) {
    if (error instanceof ApplicationError) {
      return { data: null, error: error.message, success: false };
    }
    console.error('Unexpected error:', error);
    return { data: null, error: 'Internal error', success: false };
  }
}
```

## Best Practices Checklist

### Do's ✅
- [ ] Использовать `strict: true` всегда
- [ ] Определять interfaces для component props
- [ ] Использовать type guards для валидации runtime данных
- [ ] Генерировать types из Zod schemas (`z.infer<>`)
- [ ] Избегать `any` — использовать `unknown` + type guard
- [ ] Использовать `satisfies` для проверки типов без расширения
- [ ] Константы с `as const` для буквенных типов
- [ ] JSDoc для сложных функций

### Don'ts ❌
- [ ] Не использовать `@ts-ignore` (только `@ts-expect-error` с комментарием)
- [ ] Не использовать assertion casts (`as`) без необходимости
- [ ] Не экспортировать типы, которые не используются вне модуля
- [ ] Не дублировать типы — выносить в `src/types/`
- [ ] Не использовать enum (использовать string unions + `as const`)

## ESLint Configuration

```javascript
// eslint.config.mjs — релевантные правила
{
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/prefer-as-const': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/no-unused-expressions': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  }
}
```

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
[TotalTypeScript](https://www.totaltypescript.com/)
