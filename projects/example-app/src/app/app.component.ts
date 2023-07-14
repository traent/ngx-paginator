import { Component } from '@angular/core';
import { Page } from 'projects/traent/ngx-paginator/src/lib/models';
import { UIPaginator } from 'projects/traent/ngx-paginator/src/lib/ui-paginator';
import { map, Observable, of } from 'rxjs';

type Blockchain = {
  name: string,
  nativeCurrency: string,
}

const blockchains: Blockchain[] = [
  { name: 'Algorand', nativeCurrency: 'ALGO' },
  { name: 'Avalanche', nativeCurrency: 'AVAX' },
  { name: 'Binance Smart Chain', nativeCurrency: 'BNB' },
  { name: 'Bitcoin', nativeCurrency: 'BTC' },
  { name: 'Dogecoin', nativeCurrency: 'DOGE' },
  { name: 'Litecoin', nativeCurrency: 'LTC' },
  { name: 'Monero', nativeCurrency: 'XMR' },
  { name: 'NEAR', nativeCurrency: 'NEAR' },
  { name: 'Polkadot', nativeCurrency: 'DOT' },
  { name: 'Polygon', nativeCurrency: 'MATIC' },
  { name: 'Solana', nativeCurrency: 'SOL' },
  { name: 'Stellar', nativeCurrency: 'XLM' },
  { name: 'Terra', nativeCurrency: 'LUNA' },
  { name: 'Tezos', nativeCurrency: 'XTZ' },
  { name: 'TRON', nativeCurrency: 'TRON' },
]

const makeBlockchainsPage = async (blockchains: Blockchain[], page: number, pageSize: number): Promise<Page<Observable<Blockchain>>> => {
  const blockchainsPage = blockchains.slice((page - 1) * pageSize, page * pageSize);
  const mockBlockchainsObservables = blockchainsPage.map((blockchain) => of(blockchain));
  return UIPaginator.wrapInPage(mockBlockchainsObservables, 16, page, pageSize);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly blockchains$ = of(blockchains);

  readonly blockchainPaginator$ = this.blockchains$.pipe(
    map((blockchains) => UIPaginator.makePlaceholderPaginator((page) => makeBlockchainsPage(blockchains, page, 5)),
    ));
}
