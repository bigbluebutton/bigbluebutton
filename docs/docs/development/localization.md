---
id: localization
slug: /development/localization
title: Localization
sidebar_position: 6
description: BigBlueButton Localization
keywords:
- i18n
- localization
- translation
- transifex
---

## Localizing BigBlueButton

Thanks to help from our community, BigBlueButton is localized in over fifty languages.

If you would like to help translate BigBlueButton into your language, or you see an incorrectly translated phrase in for your language that you would like to fix, here are the steps to help:

1. Create an account on [transifex.com](https://www.transifex.com/)

2. Choose the project

For helping to translate, visit the [BigBlueButton on Transifex](https://www.transifex.com/bigbluebutton/) (needs a login).

You'll see a list of languages and components of BigBlueButton ready for translation.

3. Click the name of the language you wish to translate

   If you don't find your language, please request to have it added using the Transifex menu.

#### Note: We pull the latest translations before every release and include them in the packages distributed with the release.

### Administration

#### Administrators can pull specific languages their Transifex account is associated with

Up to BigBlueButton 2.5 the script used for pulling the locales is located in the `bigbluebutton-html5` directory

https://github.com/bigbluebutton/bigbluebutton/blob/v2.5.x-release/bigbluebutton-html5/transifex.sh

You can trigger the download of the latest strings by running a command of the format `./transifex.sh pt_BR de` (passing the code for the languages you'd like to download)


