#!/bin/bash

cp footer /usr/share/meteor/bundle/programs/web.browser/footer.html

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

# generate index.json locales file if it does not exist
if [ ! -f /usr/share/meteor/bundle/programs/web.browser/app/locales/index.json ]; then
  find /usr/share/meteor/bundle/programs/web.browser/app/locales -maxdepth 1 -type f -name "*.json" -exec basename {} \; | awk 'BEGIN{printf "["}{printf "\"%s\", ", $0}END{print "]"}' | sed 's/, ]/]/' > /usr/share/meteor/bundle/programs/web.browser/app/locales/index.json
fi
