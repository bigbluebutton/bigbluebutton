import { bash, shellQuote } from './host';
import { Target } from './env';

export interface PresentationRow {
  presentationId: string;
  name: string;
  isDefault: boolean;
  uploadInProgress: boolean;
  uploadCompleted: boolean;
  errorKey: string;
  errorDetails: string;
  totalPages: number;
}

export interface PageRow {
  presentationId: string;
  num: number;
  width: number;
  height: number;
  uploadCompleted: boolean;
  urls: Record<string, string>;
}

/** Reads conversion status from akka-apps' Postgres tables (bbb_graphql). Only used when target.statusSource is db. */
export class StatusDb {
  constructor(private readonly target: Target) {}

  /** Runs a query whose rows come back as one JSON array, so names with separators or quotes cannot break parsing. */
  private async queryJson<T>(sql: string): Promise<T[]> {
    const r = await bash(`${this.target.db!.command} ${shellQuote(`select coalesce(json_agg(t), '[]'::json) from (${sql}) t`)}`, 30_000);
    if (r.code !== 0) throw new Error(`psql failed (${r.code}): ${r.stderr.trim()}`);
    return JSON.parse(r.stdout.trim() || '[]') as T[];
  }

  async available(): Promise<string | null> {
    try {
      await this.queryJson('select 1 as ok');
      return null;
    } catch (e: any) {
      return e.message;
    }
  }

  async presentations(meetingId: string): Promise<PresentationRow[]> {
    return this.queryJson<PresentationRow>(
      `select "presentationId", coalesce("name",'') as "name", coalesce("isDefault",false) as "isDefault",
              coalesce("uploadInProgress",false) as "uploadInProgress", coalesce("uploadCompleted",false) as "uploadCompleted",
              coalesce("uploadErrorMsgKey",'') as "errorKey", coalesce("uploadErrorDetailsJson"::text,'') as "errorDetails",
              coalesce("totalPages",0) as "totalPages"
         from pres_presentation where "meetingId" = '${meetingId.replace(/'/g, "''")}'`,
    );
  }

  async pages(presentationId: string): Promise<PageRow[]> {
    const rows = await this.queryJson<Omit<PageRow, 'urls'> & { urlsJson: Record<string, string> | null }>(
      `select "presentationId", "num", coalesce("width",0)::float as "width", coalesce("height",0)::float as "height",
              coalesce("uploadCompleted",false) as "uploadCompleted", "urlsJson"
         from pres_page where "presentationId" = '${presentationId.replace(/'/g, "''")}' order by "num"`,
    );
    return rows.map(({ urlsJson, ...r }) => ({ ...r, urls: urlsJson ?? {} }));
  }
}
