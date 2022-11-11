import { BehaviorSubject, firstValueFrom, Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { Page, ReadonlyBehaviorSubject } from './models';

export type UIPlaceholderList<T> = UIRealTimeList<T | null>;

const patchItems = <T>(existing: T[], newItems: T[], identityExtractor: (item: T) => unknown): T[] =>
  newItems.filter((i) => !existing.some((oldItem) => identityExtractor(oldItem) === identityExtractor(i)));

const removeItems = <T>(existing: T[], removedItemIdentity: string, identityExtractor: (item: T) => unknown): T[] =>
  existing.filter((i) => removedItemIdentity !== identityExtractor(i));

const hasId = <T>(item: T): item is T & { id: unknown } => item && 'id' in item;

type FetchMoreFn<T> = (limit: number, offset: number) => Promise<Page<T>>;
type AfterFetchFn<T> = (oldItems: T[], newItems: T[]) => T[];
type BeforeFetchFn<T> = (oldItems: T[]) => T[];

export type ItemSourceType<T> = {
  type: 'add' | 'update';
  itemKey: string;
  item: T;
} | {
  type: 'delete';
  itemKey: string;
};
type ItemSourceStream<T> = Observable<ItemSourceType<T>> | undefined;

// NOTE: the static methods work around the usual Angular compiler behaviour as
// suggested here https://github.com/ng-packagr/ng-packagr/issues/696
// A more appropriate fix would be to have them as freestanding functions.
export class UIRealTimeList<T> {
  private readonly _complete$ = new BehaviorSubject(false);
  private readonly _items$ = new BehaviorSubject<T[]>([]);
  private readonly _loading$ = new BehaviorSubject(false);
  /** Define if loadMore has been called at least one time and it has finished (both success or error) */
  private readonly _init$ = new BehaviorSubject(false);
  private readonly _error$ = new BehaviorSubject(false);
  private readonly _page$ = new BehaviorSubject(0);
  private readonly _total$ = new BehaviorSubject(0);

  private readonly _offset$ = new BehaviorSubject(0);
  private readonly _limit$ = new BehaviorSubject(20);
  private readonly _eventsCount$ = new BehaviorSubject(0);

  readonly complete = new ReadonlyBehaviorSubject(this._complete$);
  readonly items = new ReadonlyBehaviorSubject(this._items$);
  readonly loading = new ReadonlyBehaviorSubject(this._loading$);
  readonly init = new ReadonlyBehaviorSubject(this._init$);
  readonly error = new ReadonlyBehaviorSubject(this._error$);
  readonly page = new ReadonlyBehaviorSubject(this._page$);
  readonly total = new ReadonlyBehaviorSubject(this._total$);

  readonly offset = new ReadonlyBehaviorSubject(this._offset$);
  readonly limit = new ReadonlyBehaviorSubject(this._limit$);
  readonly eventsCount = new ReadonlyBehaviorSubject(this._eventsCount$);

  readonly eventsSubscription?: Subscription;

  constructor(
    private readonly fetchMore: FetchMoreFn<T>,
    private readonly itemsSource$: ItemSourceStream<T>,
    private readonly afterFetch: AfterFetchFn<T> = (oldItems, newItems) => [...oldItems, ...newItems],
    private readonly beforeFetch: BeforeFetchFn<T> = (oldItems) => oldItems,
    private readonly identityExtractor: (item: T) => T | unknown = (item) => hasId(item) ? item.id : item,
    limit: number = 20,
  ) {
    this._limit$.next(limit);

    this.eventsSubscription = this.itemsSource$?.subscribe(async (event) => {
      const currentTotal = this.total.value;
      const currentEventsCount = this.eventsCount.value;
      const currentItems = this.items.value;
      const complete = this._complete$.value;
      switch (event.type) {
        case 'add':
          const itemsAdded = afterFetch(currentItems, patchItems(currentItems, [event.item], this.identityExtractor));

          if (itemsAdded.length === currentItems.length) {
            return;
          }

          const isListAddedGreaterThanPageItems = itemsAdded.length > this.page.value * this.limit.value;
          const isLatestItemEqualToItemAdded =
            this.identityExtractor(itemsAdded[itemsAdded.length - 1]) === this.identityExtractor(event.item);

          this._total$.next(currentTotal + 1);

          if (!complete && isLatestItemEqualToItemAdded) {
            return;
          }

          if (!isListAddedGreaterThanPageItems) {
            this._eventsCount$.next(currentEventsCount + 1);
          } else {
            this._eventsCount$.next(0);
            this._complete$.next(false);
          }
          this._items$.next(itemsAdded.slice(0, this.page.value * this.limit.value));

          return;
        case 'update':
          let isInList = false;
          const itemsMerged = currentItems.map(
            (item) => {
              if (this.identityExtractor(item) === this.identityExtractor(event.item)) {
                isInList = true;
                return event.item;
              } else {
                return item;
              }
            });

          const itemsUpdated = afterFetch(itemsMerged, isInList ? [] : [event.item]);

          this._items$.next(itemsUpdated.splice(0, this.page.value * this.limit.value));
          return;
        case 'delete':
          this._items$.next(removeItems(currentItems, event.itemKey, this.identityExtractor));
          const newItems = this.items.value;

          const newTotal = currentTotal - (currentItems.length - newItems.length);
          this._total$.next(newTotal);

          if (newItems.length < this.page.value * this.limit.value) {
            this._eventsCount$.next(currentEventsCount - 1);
            // ensures that an additional item is retrieved as a replacement, if available
            await this.loadMore(1);
          }

          return;
      }
    });
  }

  static makePlaceholderList<R>(
    fetchMore: FetchMoreFn<R>,
    itemsSource$: ItemSourceStream<R>,
    afterFetch: AfterFetchFn<R | null> = (oldItems, newItems) => [...oldItems.filter((i) => !!i), ...newItems],
    placeholderLength = 20,
    limit = placeholderLength,
  ): UIRealTimeList<R | null> {
    const r = new UIRealTimeList<R | null>(
      fetchMore,
      itemsSource$,
      afterFetch,
      (oldItems) => [...oldItems, ...Array(placeholderLength).fill(null)],
      (item) => hasId(item) ? item.id : item,
      limit,
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

  async loadMore(forceLimit?: number): Promise<void> {
    if (this.loading.value) {
      await firstValueFrom(this._loading$.pipe(first((x) => !!x)));
      return;
    }

    this._loading$.next(true);
    this._error$.next(false);
    try {
      const currentItemsLength = this.items.value.length;
      this._items$.next(this.beforeFetch(this.items.value));

      const limit = forceLimit ? forceLimit : this.limit.value;
      const offset = this.offset.value + this.eventsCount.value;

      const fetchedItems = await this.fetchMore(limit, offset);
      const fetchedItemsLen = currentItemsLength + fetchedItems.items.length;
      if (fetchedItems.items.length === 0 || fetchedItemsLen >= fetchedItems.total) {
        this._complete$.next(true);
      }
      this._total$.next(fetchedItems.total);

      const patchedItems = {
        ...fetchedItems,
        items: patchItems(this.items.value, fetchedItems.items, this.identityExtractor),
      };

      if (!forceLimit) {
        this._page$.next(this._page$.value + 1);
        this._offset$.next(this.offset.value + this.limit.value);
      } else {
        this._eventsCount$.next(0);
      }
      this._items$.next(this.afterFetch(this.items.value, patchedItems.items));
    } catch {
      this._items$.next(this.items.value.filter((item) => item !== null));
      this._error$.next(true);
    }
    finally {
      this._loading$.next(false);
      this._init$.next(true);
    }
  }
}
