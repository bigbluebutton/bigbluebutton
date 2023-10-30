export interface UrlsJson {
    png: string;
    svg: string;
    text: string;
    thumb: string;
}

export interface CurrentPage {
    num: number;
    pageId: string;
    urlsJson: UrlsJson;
}

export interface CurrentPresentation {
    presentationId: string;
    pages: CurrentPage[];
}
