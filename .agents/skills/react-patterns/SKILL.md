# React Patterns Skill

> Паттерны и best practices для React/Next.js компонентов в проекте кейтеринговой компании.

## Когда использовать

- При создании новых компонентов
- При рефакторинге существующих
- При code review
- При решении проблем с ре-рендерами или производительностью

## Component Architecture

### File Structure

```
src/components/
├── catering/          # Бизнес-компоненты (Hero, Menu, Calculator)
│   ├── hero.tsx
│   ├── hero.test.tsx
│   └── hooks/
│       └── use-hero-animation.ts
├── ui/               # Базовые UI (Button, Card, Input) — shadcn/ui
├── media/            # Медиа-компоненты (VideoPlayer, SmartImage)
├── motion/           # Анимационные обёртки (Reveal, ScrollScene)
└── providers/        # Context providers
```

### Component Patterns

#### 1. Compound Components (Калькулятор)

```tsx
// calculator.tsx — compound pattern
interface CalculatorContextValue {
  eventType: EventTypeId;
  setEventType: (type: EventTypeId) => void;
  guests: number;
  setGuests: (n: number) => void;
  total: number;
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

function useCalculator() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error('Calculator components must be used within <Calculator>');
  return ctx;
}

export function Calculator({ children }: { children: React.ReactNode }) {
  const [eventType, setEventType] = useState<EventTypeId>('banquet');
  const [guests, setGuests] = useState(50);
  
  // ... logic
  
  return (
    <CalculatorContext.Provider value={{ eventType, setEventType, guests, setGuests, total }}>
      <form className="calculator">{children}</form>
    </CalculatorContext.Provider>
  );
}

Calculator.TypeSelector = function TypeSelector() {
  const { eventType, setEventType } = useCalculator();
  return <TypeSelector value={eventType} onChange={setEventType} />;
};

Calculator.GuestsInput = function GuestsInput() {
  const { guests, setGuests } = useCalculator();
  return <GuestsInput value={guests} onChange={setGuests} />;
};

Calculator.Result = function Result() {
  const { total } = useCalculator();
  return <ResultPanel amount={total} />;
};

// Использование:
<Calculator>
  <Calculator.TypeSelector />
  <Calculator.GuestsInput />
  <Calculator.Result />
</Calculator>
```

#### 2. Render Props / Function as Child (Галерея)

```tsx
// events-gallery.tsx
interface EventsGalleryProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  layout?: 'grid' | 'masonry';
  emptyState?: React.ReactNode;
}

export function EventsGallery<T extends { id: string; src: string; alt: string }>({
  items,
  renderItem,
  layout = 'grid',
  emptyState,
}: EventsGalleryProps<T>) {
  if (items.length === 0) return <>{emptyState}</>;
  
  return (
    <div className={cn(
      'gallery',
      layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : 'masonry'
    )}>
      {items.map((item, index) => (
        <Fragment key={item.id}>{renderItem(item, index)}</Fragment>
      ))}
    </div>
  );
}
```

#### 3. Controller-View Pattern (Форма заявки)

```tsx
// contact-form.tsx
// Controller — логика и состояние
function ContactFormController({ onSubmit }: { onSubmit: (data: LeadPayload) => void }) {
  const [state, dispatch] = useFormReducer(initialState);
  
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate(state.values)) {
      dispatch({ type: 'SET_ERRORS', errors: getValidationErrors(state.values) });
      return;
    }
    
    dispatch({ type: 'SET_SUBMITTING' });
    try {
      await onSubmit(state.values);
      dispatch({ type: 'SET_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', error: error.message });
    }
  }, [state.values, onSubmit]);
  
  return (
    <ContactFormView
      values={state.values}
      errors={state.errors}
      isSubmitting={state.isSubmitting}
      isSuccess={state.isSuccess}
      fieldHandlers={{
        setName: (v) => dispatch({ type: 'SET_FIELD', field: 'name', value: v }),
        setPhone: (v) => dispatch({ type: 'SET_FIELD', field: 'phone', value: v }),
        setEventType: (v) => dispatch({ type: 'SET_FIELD', field: 'eventType', value: v }),
      }}
      onSubmit={handleSubmit}
    />
  );
}

// View — только рендеринг
interface ContactFormViewProps {
  values: Partial<LeadPayload>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSuccess: boolean;
  fieldHandlers: Record<string, (value: unknown) => void>;
  onSubmit: (e: FormEvent) => void;
}

function ContactFormView({ values, errors, isSubmitting, isSuccess, fieldHandlers, onSubmit }: ContactFormViewProps) {
  if (isSuccess) return <SuccessMessage />;
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        value={values.name ?? ''}
        onChange={(e) => fieldHandlers.setName(e.target.value)}
        error={errors.name}
        placeholder="Ваше имя"
      />
      {/* ... */}
    </form>
  );
}
```

## State Management Patterns

### 1. Local State (useState + useReducer)

```tsx
// Простое состояние — useState
const [isOpen, setIsOpen] = useState(false);

// Сложное состояние — useReducer
type MenuState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: MenuItem[] }
  | { status: 'error'; error: string };

type MenuAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; data: MenuItem[] }
  | { type: 'FETCH_ERROR'; error: string };

function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'FETCH_START': return { status: 'loading' };
    case 'FETCH_SUCCESS': return { status: 'success', data: action.data };
    case 'FETCH_ERROR': return { status: 'error', error: action.error };
    default: return state;
  }
}
```

### 2. Server State (TanStack Query)

```tsx
// hooks/use-menu.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useMenuItems(categoryId?: string) {
  return useQuery({
    queryKey: ['menu', categoryId],
    queryFn: () => fetchMenuItems(categoryId),
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000,   // 10 минут (бывший cacheTime)
  });
}

export function useSubmitLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Заявка отправлена!');
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });
}
```

### 3. Client State (Zustand)

```tsx
// stores/calculator-store.ts
import { create } from 'zustand';

interface CalculatorStore {
  typeId: EventTypeId;
  guests: number;
  includeService: boolean;
  setDate: (date: string) => void;
  setTypeId: (id: EventTypeId) => void;
  setGuests: (n: number) => void;
  toggleService: () => void;
  getTotal: () => number;
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  typeId: 'banquet',
  guests: 50,
  includeService: false,
  
  setDate: (date) => set({ eventDate: date }, false, 'setDate'),
  setTypeId: (typeId) => set({ typeId }, false, 'setTypeId'),
  setGuests: (guests) => set({ 
    guests: Math.max(10, Math.min(500, guests)) 
  }, false, 'setGuests'),
  toggleService: () => set(
    (s) => ({ includeService: !s.includeService }), 
    false, 
    'toggleService'
  ),
  
  getTotal: () => {
    const { typeId, guests, includeService } = get();
    const basePrice = PRICING[typeId];
    let total = basePrice * guests;
    if (isSeasonalDate(get().eventDate)) total *= 1.15;
    if (includeService) total += 500;
    return total;
  },
}));
```

## Performance Patterns

### 1. Memoization

```tsx
// ✅ Правильно — мемизация дорогих вычислений
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.price - b.price),
  [items]
);

const handleClick = useCallback(
  (id: string) => onSelectItem(id),
  [onSelectItem]
);

// ✅ React.memo для компонента с стабильными props
const GalleryItem = React.memo(function GalleryItem({ item }: { item: GalleryItemType }) {
  return <article>{/* ... */}</article>;
});
```

### 2. Virtualization (для длинных списков)

```tsx
// Если будет длинный список отзывов/мероприятий
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={items[virtualItem.index].id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ListItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Code Splitting by Routes/Features

```tsx
// Тяжёлые компоненты — dynamic import
import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('@/components/catering/hero'), {
  ssr: true,
  loading: () => <HeroSkeleton />,
});

const VideoPlayer = dynamic(() => import('@/components/media/video-player'), {
  ssr: false, // Browser API
  loading: () => <VideoSkeleton />,
});
```

## Custom Hooks Library

### useIntersectionObserver

```typescript
// hooks/use-intersection-observer.ts
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);
  
  return [ref, isIntersecting];
}
```

### useMediaQuery

```typescript
// hooks/use-media-query.ts
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
}

// Использование
const isMobile = useMediaQuery('(max-width: 768px)');
const isTablet = useMediaQuery('(max-width: 1024px)');
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
```

### useLocalStorage

```typescript
// hooks/use-local-storage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
      return newValue;
    });
  }, [key]);
  
  return [storedValue, setValue];
}
```

## Error Boundary

```tsx
// components/error-boundary.tsx
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Component error:', error, info);
    // Отправить в Sentry/logging service
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-destructive/10 p-8">
          <p className="text-destructive">Что-то пошло не так</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Использование
<ErrorBoundary fallback={<CustomErrorUI />}>
  <EventsGallery />
</ErrorBoundary>
```

## Anti-Patterns to Avoid

### ❌ Don't

```tsx
// Не создавать компоненты в рендере
function BadComponent() {
  // ❌ Каждый рендер — новый компонент
  const [value, setValue] = useState('');
  return <HeavyComponent onChange={(v) => setValue(v)} />;
}

// Не использовать индексы как key для изменяемых списков
{items.map((item, i) => <Item key={i} {...item} />)}

// Не мутировать props/state напрямую
function BadComponent({ items }) {
  items.push(newItem); // ❌ мутация!
  setItems(items);     // ❌ та же ссылка!
}

// Не использовать useEffect для преобразований данных
function BadComponent({ rawdata }) {
  const [processed, setProcessed] = useState([]);
  
  useEffect(() => {
    setProcessed(process(rawdata)); // ❌ лишний рендер
  }, [rawdata]);
  
  // ✅ Лучше useMemo
  const processed = useMemo(() => process(rawdata), [rawdata]);
}
```

## Testing Patterns

```tsx
// hero.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Hero Section', () => {
  it('renders headline and CTA buttons', () => {
    render(<Hero />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
  
  it('handles CTA click', async () => {
    const user = userEvent.setup();
    const onCtaClick = vi.fn();
    
    render(<Hero onCtaClick={onCtaClick} />);
    
    await user.click(screen.getByRole('button', { name: /рассчитать стоимость/i }));
    expect(onCtaClick).toHaveBeenCalled();
  });
  
  it('shows animated counters after scroll into view', async () => {
    render(<Hero />);
    
    // Имитация intersection observer
    const counters = screen.getAllByTestId('counter');
    
    // Проверка начальных значений
    counters.forEach(counter => {
      expect(counter).toHaveTextContent('0');
    });
    
    // Trigger intersection
    fireEvent(screen.getByTestId('hero-section'), new Event('intersect'));
    
    await waitFor(() => {
      expect(screen.getByTestId('counter-years')).toHaveTextContent('16');
    });
  });
});
```

## References

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
[React Patterns](https://www.reactpatterns.com/)
