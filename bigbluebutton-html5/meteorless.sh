#!/bin/bash

mkdir -p /usr/share/bigbluebutton/nginx/locales-endpoint
cp locales-endpoint.json /usr/share/bigbluebutton/nginx/locales-endpoint/index.json
cp footer.html /usr/share/meteor/bundle/programs/web.browser/

cd /usr/share/meteor/bundle/programs/web.browser

css_file=$(find . -maxdepth 1 -type f -name "*.css" | head -n 1 | sed 's|^./||')
js_file=$(find . -maxdepth 1 -type f -name "*.js" | head -n 1 | sed 's|^./||')

css_content='<link rel="stylesheet" type="text/css" class="__meteor-css__" href="/html5client/placeholder?meteor_css_resource=true">'
css_content="${css_content/placeholder/$css_file}"

footer_content=$(<footer.html)
footer_content="${footer_content/placeholder/$js_file}"

echo '<!DOCTYPE html>' > index.html
echo '<html>' >> index.html
echo '<head>' >> index.html
echo '  <base href="/html5client/" />' >> index.html
echo $css_content >> index.html

cat head.html >> index.html
cat body.html >> index.html
echo $footer_content >> index.html
echo '</body>' >> index.html
