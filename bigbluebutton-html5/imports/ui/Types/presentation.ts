export interface Presentation {
    heightRatio: number,
    isCurrentPage: boolean,
    meetingId: string,
    num: number,
    pageId: string,
    presentation: PresentationInfo,
    slideRevealed: boolean,
    urls: string,
    widthRatio: number,
    xOffset: number,
    yOffset: number,
}

export interface PresentationInfo {
    current: boolean,
    downloadable: boolean,
    meetingId: string,
    presentationId: string,
    removable: boolean,
}

export interface PresentationPluginProjection {
    isCurrentPage: boolean,
    num: number,
    pageId: number,
    presentationId: string,
    slideRevealed: boolean,
    urls: string,
}
