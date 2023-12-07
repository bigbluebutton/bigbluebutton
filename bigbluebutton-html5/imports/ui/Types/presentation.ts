export interface UrlsJson {
    thumbnail: string
    png: string
    svg: string
    text: string
}

export interface CurrentPage {
    num: number;
    pageId: string;
    urlsJson: {
        thumbnail: string;
        png: string;
        svg: string;
        text: string;
    };
}

export interface CurrentPresentation {
    presentationId: string;
    pages: CurrentPage[];
}
