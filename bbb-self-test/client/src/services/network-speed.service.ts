import axios from 'axios';
import { apiRoutes } from '../routing/backend-config';

class NetworkSpeedService {
    getDownloadSpeed() {
        return axios.get(apiRoutes.DOWNLOAD_URL);
    }

    getUploadSpeed() {
        return axios.get(apiRoutes.UPLOAD_URL);
    }
    getPing(){
        return axios.get(apiRoutes.PING_URL);
    }
}

export default new NetworkSpeedService();