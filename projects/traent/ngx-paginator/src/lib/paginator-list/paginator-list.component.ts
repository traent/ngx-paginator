/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

import { UIPaginator } from '../ui-paginator';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'ngx-t3-paginator-list',
  templateUrl: './paginator-list.component.html',
  styleUrls: ['./paginator-list.component.scss'],
})
export class PaginatorListComponent<T> {
  private _paginator?: UIPaginator<T>;

  @ContentChild('loadMoreButton', { read: TemplateRef }) customLoadMoreButtonTemplate?: TemplateRef<any>;
  @ContentChild('loader', { read: TemplateRef }) customLoaderTemplate?: TemplateRef<any>;
  @ContentChild('loadMoreError', { read: TemplateRef }) customLoadMoreErrorTemplate?: TemplateRef<any>;

  @Input() loader = false;
  @Input() inverse = false;
  @Input() hideLoadMore = false;
  @Input() set paginator(paginator: UIPaginator<T> | undefined) {
    this._paginator = paginator;
    // Trigger the initial fetching on the passed paginator
    requestAnimationFrame(() => paginator?.loadMore());
  }

  get paginator(): UIPaginator<T> | undefined {
    return this._paginator;
  }
}
