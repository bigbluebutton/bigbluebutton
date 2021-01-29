interface RelativeTimeFormat {
    format(value: number, unit: string): string;
    formatToParts(value: number, unit: string): {
        value: string;
    }[];
    resolvedOptions(): ResolvedRelativeTimeFormatOptions;
}
interface ResolvedRelativeTimeFormatOptions extends Pick<RelativeTimeFormatOptions, 'numeric' | 'style'> {
    locale: string;
}
interface RelativeTimeFormatOptions {
    localeMatcher: 'best fit' | 'lookup';
    numeric: 'always' | 'auto';
    style: 'long' | 'short' | 'narrow';
}
declare let RelativeTimeFormat: {
    new (locales?: string | string[], opts?: RelativeTimeFormatOptions): RelativeTimeFormat;
    (locales?: string | string[], opts?: RelativeTimeFormatOptions): RelativeTimeFormat;
    supportedLocalesOf(locales: string | string[], opts?: Pick<RelativeTimeFormatOptions, 'localeMatcher'>): string[];
};
interface MemoizeFormatConstructorFn {
    (constructor: typeof Intl.NumberFormat): (...args: ConstructorParameters<typeof Intl.NumberFormat>) => Intl.NumberFormat;
    (constructor: typeof Intl.DateTimeFormat): (...args: ConstructorParameters<typeof Intl.DateTimeFormat>) => Intl.DateTimeFormat;
    (constructor: typeof RelativeTimeFormat): (...args: ConstructorParameters<typeof RelativeTimeFormat>) => RelativeTimeFormat;
    (constructor: any): (...args: any[]) => any;
}
declare const memoizeFormatConstructor: MemoizeFormatConstructorFn;
export default memoizeFormatConstructor;
