language-mapping-list
=====================

List of all the known languages in their English and Native name with locales.

There are over 200 languages available in the list.

`$ npm install langmap`

Usage:

```
var langmap = require("langmap");

"Native" => English (US)
var native = langmap["en-US"]["nativeName"];
"Native" => ภาษาไทย
var native = langmap["th"]["nativeName"];
"English" => Thai
var native = langmap["th"]["englishName"];

```