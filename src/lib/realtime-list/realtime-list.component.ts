/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

import { UIRealTimeList } from '../ui-realtime-list';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ngx-t3-realtime-list',
  templateUrl: './realtime-list.component.html',
  styleUrls: ['./realtime-list.component.scss'],
})
export class RealtimeListComponent<T> {
  private _list?: UIRealTimeList<T>;

  @ContentChild('loadMoreButton', { read: TemplateRef }) customLoadMoreButtonTemplate?: TemplateRef<any>;
  @ContentChild('loader', { read: TemplateRef }) customLoaderTemplate?: TemplateRef<any>;
  @ContentChild('loadMoreError', { read: TemplateRef }) customLoadMoreErrorTemplate?: TemplateRef<any>;

  @Input() loader = false;
  @Input() inverse = false;
  @Input() hideLoadMore = false;
  @Input() set list(list: UIRealTimeList<T> | undefined) {
    this._list = list;
    // Trigger the initial fetching on the passed paginator
    requestAnimationFrame(() => list?.loadMore());
  }
  get list(): UIRealTimeList<T> | undefined {
    return this._list;
  }
}
