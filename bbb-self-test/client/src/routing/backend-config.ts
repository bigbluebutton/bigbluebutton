const API_URL : string | undefined = process.env.REACT_APP_API_ROUTE;

export const apiRoutes = {
    DOWNLOAD_URL: API_URL + '/downloadResults',
    UPLOAD_URL: API_URL + '/uploadResults',
    PING_URL:  API_URL+ '/ping'
};