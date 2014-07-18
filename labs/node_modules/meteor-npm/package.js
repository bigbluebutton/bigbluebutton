var path = Npm.require('path');
var fs = Npm.require('fs');
var packagesJsonFile = path.resolve('./packages.json');

//creating `packages.json` file for the first-time if not exists
if(!fs.existsSync(packagesJsonFile)) {
  fs.writeFileSync(packagesJsonFile, '{\n  \n}')
}

try {
  var fileContent = fs.readFileSync(packagesJsonFile);
  var packages = JSON.parse(fileContent.toString());
  Npm.depends(packages);
} catch(ex) {
  console.error('ERROR: packages.json parsing error [ ' + ex.message + ' ]');
}

Package.describe({
  summary: "complete npm integration/support for Meteor"
});

Package.on_use(function (api, where) {
  api.export('Async');

  var packagesFile = './.meteor/packages';
  if(fs.existsSync(packagesFile) && isNewerMeteor) {
    api.add_files(['index.js', '../../packages.json'], 'server');
  } else {
    api.add_files(['index.js'], 'server');
  }

  function isNewerMeteor() {
    return fs.readFileSync(packagesFile, 'utf8').match(/\nstandard-app-packages/);
  }
});

Package.on_test(function (api) {
  api.use(['tinytest']);
  api.add_files(['index.js', 'test.js'], 'server');
});
