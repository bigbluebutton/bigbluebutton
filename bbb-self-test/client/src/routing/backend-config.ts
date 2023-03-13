const API_URL : string | undefined = process.env.REACT_APP_API_ROUTE;

export const apiRoutes = {
    DOWNLOAD_URL: API_URL + '/download',
    UPLOAD_URL: API_URL + '/upload',
};