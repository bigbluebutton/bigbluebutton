// Loaded last by application.groovy; the variables come from /etc/bigbluebutton/bigbluebutton.env
if (System.getenv("BBB_URL")) {
    bigbluebutton.web.serverURL = System.getenv("BBB_URL")
}
if (System.getenv("BBB_SECRET")) {
    securitySalt = System.getenv("BBB_SECRET")
}
