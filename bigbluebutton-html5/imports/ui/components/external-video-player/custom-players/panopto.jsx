const MATCH_URL = /https?\:\/\/([^\/]+\/Panopto)(\/Pages\/Viewer\.aspx\?id=)([-a-zA-Z0-9]+)/;

export class Panopto {

  static canPlay = url => {
    return MATCH_URL.test(url)
  };

  static getSocialUrl(url) {
    const m = url.match(MATCH_URL);
    return 'https://' + m[1] + '/Podcast/Social/' + m[3] + '.mp4';
  }
}

export default Panopto;

