export interface CurrentPresentationForPluginHook {
    presentationId: string,
    pages: CurrentPage[],
}

export interface CurrentPage {
    num: number,
    pageId: string,
    urls: string,
}
