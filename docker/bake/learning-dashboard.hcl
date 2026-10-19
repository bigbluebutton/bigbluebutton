# The learning analytics dashboard app, served on port 8080 (compose service
# `learning-dashboard`; the edge nginx proxies /learning-analytics-dashboard/ to it).
target "_learning-dashboard-tags" {
      tags = bbb_image_tags("learning-dashboard")
}

target "learning-dashboard" {
      inherits = ["_learning-dashboard-tags", "docker-metadata-action", "_entrypoint-lib"]
      platforms = compact(split(",", BBB_PLATFORMS))
      context = "./bbb-learning-dashboard"
}
