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

#### Note: The localized strings are included in BigBlueButton's packages

We use an integration between Transifex (where the strings are translated) and GitHub (where BigBlueButton's source code is hosted). The integration syncronizes the fully translated strings so that they are ready to be included in the upcoming BigBlueButton release. [Example of an automated pull request from Transifex:](https://github.com/bigbluebutton/bigbluebutton/pull/17799)

We receive pull requests from Transifex when a localized language reaches 100% completion OR when a localized string is updated in a 100% localized locale. This means that if you made a recent modification to the strings and you're not seeing it in the latest version of BigBlueButton, likely either the locale is not 100% complete, or there has been no new BigBlueButton release on the specific branch since you made the changes.
