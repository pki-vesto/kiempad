import type { CentralRecordListPage, CentralRecordListPageOptions } from './centralDatabase';
import type { EncryptedRecord } from './records';

export type CentralRecordPageLoader = {
  listRecordsPage(options?: CentralRecordListPageOptions): Promise<CentralRecordListPage>;
};

export type CentralRecordLoadStatusState =
  | 'loading'
  | 'page-loaded'
  | 'empty-page'
  | 'complete'
  | 'error';

export type CentralRecordLoadStatus = {
  state: CentralRecordLoadStatusState;
  page: number;
  loadedRecords: number;
  hasNextCursor: boolean;
  message: string;
};

export type CentralRecordLoadResult = {
  records: EncryptedRecord[];
  statuses: CentralRecordLoadStatus[];
};

export async function loadCentralRecordPagesWithStatus(
  loader: CentralRecordPageLoader,
  options: CentralRecordListPageOptions = {},
): Promise<CentralRecordLoadResult> {
  const records: EncryptedRecord[] = [];
  const statuses: CentralRecordLoadStatus[] = [];
  let cursor = options.cursor;
  let page = 1;

  while (true) {
    statuses.push({
      state: 'loading',
      page,
      loadedRecords: records.length,
      hasNextCursor: Boolean(cursor),
      message: 'Centrale recordpagina wordt geladen zonder recordinhoud te tonen.',
    });

    let result: CentralRecordListPage;
    try {
      result = await loader.listRecordsPage({ ...options, cursor });
    } catch (_error) {
      statuses.push({
        state: 'error',
        page,
        loadedRecords: records.length,
        hasNextCursor: Boolean(cursor),
        message:
          'Centrale recordpagina kon niet worden geladen. Herlaad Kiempad en probeer opnieuw; recordinhoud is niet getoond.',
      });
      return { records, statuses };
    }

    records.push(...result.records);
    statuses.push({
      state: result.records.length === 0 ? 'empty-page' : 'page-loaded',
      page,
      loadedRecords: records.length,
      hasNextCursor: Boolean(result.nextCursor),
      message:
        result.records.length === 0
          ? 'Centrale recordpagina is leeg; er is geen recordinhoud getoond.'
          : `Centrale recordpagina ${page} geladen met ${result.records.length} versleutelde record${result.records.length === 1 ? '' : 's'}.`,
    });

    if (!result.nextCursor) break;
    cursor = result.nextCursor;
    page += 1;
  }

  statuses.push({
    state: 'complete',
    page,
    loadedRecords: records.length,
    hasNextCursor: false,
    message: `${records.length} versleutelde record${records.length === 1 ? '' : 's'} over ${page} pagina${page === 1 ? '' : "'s"} gecontroleerd zonder plaintext.`,
  });

  return { records, statuses };
}
