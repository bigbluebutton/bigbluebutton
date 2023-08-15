export interface CurrentPage {
    num: number;
    pageId: string;
    urls: string;
}

export interface CurrentPresentation {
    presentationId: string;
    pages: CurrentPage[];
}
