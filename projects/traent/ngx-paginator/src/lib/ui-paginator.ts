import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { Page, ReadonlyBehaviorSubject } from './models';

export type UIPlaceholderPaginator<T> = UIPaginator<T | null>;

const patchItems = <T>(existing: T[], newItems: T[], identityExtractor: (item: T) => unknown): T[] =>
  newItems.filter((i) => !existing.some((oldItem) => identityExtractor(oldItem) === identityExtractor(i)));

const hasId = <T>(item: T): item is T & { id: unknown } => item && typeof item === 'object' && 'id' in item;

// NOTE: the static methods work around the usual Angular compiler behaviour as
// suggested here https://github.com/ng-packagr/ng-packagr/issues/696
// A more appropriate fix would be to have them as freestanding functions.
export class UIPaginator<T> {
  private readonly _complete$ = new BehaviorSubject(false);
  private readonly _items$ = new BehaviorSubject<T[]>([]);
  private readonly _loading$ = new BehaviorSubject(false);
  private readonly _error$ = new BehaviorSubject(false);
  private readonly _page$ = new BehaviorSubject(0);
  private readonly _total$ = new BehaviorSubject(0);

  readonly complete = new ReadonlyBehaviorSubject(this._complete$);
  readonly items = new ReadonlyBehaviorSubject(this._items$);
  readonly loading = new ReadonlyBehaviorSubject(this._loading$);
  readonly error = new ReadonlyBehaviorSubject(this._error$);
  readonly page = new ReadonlyBehaviorSubject(this._page$);
  readonly total = new ReadonlyBehaviorSubject(this._total$);

  constructor(
    private readonly fetchMore: (page: number) => Promise<Page<T>>,
    private readonly beforeFetch: (oldItems: T[]) => T[] = (oldItems) => oldItems,
    private readonly afterFetch: (oldItems: T[], newItems: T[]) => T[] =
      (oldItems, newItems) => [...oldItems, ...newItems],
    private readonly identityExtractor: (item: T) => T | unknown = (item) => hasId(item) ? item.id : item,
  ) {
  }

  static makeEmptyPlaceholderPaginator<R>(): UIPaginator<R | null> {
    const r = new UIPaginator<R | null>(
      async () => ({ items: [] as R[], page: { offset: 0, limit: 1 }, total: 0 }),
    );
    return r;
  }

  static makePlaceholderPaginator<R>(fetchMore: (page: number) => Promise<Page<R>>, placeholderLength = 20): UIPaginator<R | null> {
    const r = new UIPaginator<R | null>(
      fetchMore,
      (oldItems) => [...oldItems, ...Array(placeholderLength).fill(null)],
      (oldItems, newItems) => [...oldItems.filter((i) => !!i), ...newItems],
    );
    return r;
  }

  static toOffset(page = 1, limit = 20): number {
    const r = (page - 1) * limit;
    return r;
  }

  static wrapInPage<R>(items: R[], total: number, page: number = 1, limit: number = 20): Page<R> {
    const r = {
      total,
      items,
      page: {
        offset: this.toOffset(page, limit),
        limit,
      },
    };
    return r;
  }

  async loadMore(): Promise<void> {
    if (this.loading.value) {
      await firstValueFrom(this._loading$.pipe(first((x) => !!x)));
      return;
    }

    this._loading$.next(true);
    this._error$.next(false);
    try {
      const currentItemsLength = this.items.value.length;
      this._items$.next(this.beforeFetch(this.items.value));
      const fetchedItems = await this.fetchMore(this.page.value + 1);
      const fetchedItemsLen = currentItemsLength + fetchedItems.items.length;
      if (fetchedItems.items.length === 0 || fetchedItemsLen >= fetchedItems.total) {
        this._complete$.next(true);
      }
      this._total$.next(fetchedItems.total);

      const patchedItems = {
        ...fetchedItems,
        items: patchItems(this.items.value, fetchedItems.items, this.identityExtractor),
      };

      this._page$.next(this._page$.value + 1);
      this._items$.next(this.afterFetch(this.items.value, patchedItems.items));
    } catch {
      this._items$.next(this.items.value.filter((item) => item !== null));
      this._error$.next(true);
    }
    finally {
      this._loading$.next(false);
    }
  }

  async loadOnTop(): Promise<void> {
    if (this.loading.value) {
      await firstValueFrom(this._loading$.pipe(first((x) => !!x)));
      return;
    }

    this._loading$.next(true);
    try {
      const fetchedItems = await this.fetchMore(1);
      this._total$.next(fetchedItems.total);

      const patchedItems = {
        ...fetchedItems,
        items: patchItems(this.items.value, fetchedItems.items, this.identityExtractor),
      };

      this._items$.next([...patchedItems.items, ...this.items.value]);
    } finally {
      this._loading$.next(false);
    }
  }
}
