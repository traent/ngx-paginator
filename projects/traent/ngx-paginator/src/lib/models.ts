import { Observable, BehaviorSubject } from 'rxjs';

// NOTE: this should be imported from `t3-ts-utils` but it breaks the build process right now
export class ReadonlyBehaviorSubject<T> {
  get value(): T {
    return this.subject$.value;
  }

  get value$(): Observable<T> {
    return this.subject$;
  }

  constructor(private readonly subject$: BehaviorSubject<T>) {
  }
}

export interface Page<T> {
  items: Array<T>;
  total: number;
  page: {
    offset: number;
    limit: number;
  };
}

export interface UIPaginationParams {
  page: number;
  limit?: number;
  offset?: number;
}
