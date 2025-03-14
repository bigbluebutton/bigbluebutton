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

export interface PresPresentation {
    uploadTemporaryId?: string;
    uploadInProgress: boolean;
    current: boolean;
    downloadFileUri: string;
    downloadable: boolean;
    uploadErrorDetailsJson?: object;
    uploadErrorMsgKey?: string;
    filenameConverted?: string;
    isDefault: boolean;
    name: string;
    totalPages: number;
    totalPagesUploaded: number;
    presentationId: string;
    uploadCompletionNotified: boolean;
    removable: boolean;
    uploadCompleted: boolean;
    exportToChatInProgress?: boolean;
    exportToChatStatus?: string;
    exportToChatCurrentPage?: number;
    exportToChatHasError?: boolean;
}
