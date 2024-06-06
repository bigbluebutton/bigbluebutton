---
id: customize
slug: /greenlight/v3/customize
title: Customize Greenlight
sidebar_position: 3
description: Greenlight customization
keywords:
- greenlight
- customization
---

Greenlight v3 can be customized to suit your needs. By default, the applications has a default set of features and settings that can be customized through the Administrator Panel. If you need even more customizations, please follow the steps below.

---

**IMPORTANT NOTE:** While customizing Greenlight v3 can be a great way to tailor the platform to your organization's specific needs, there are also some potential dangers to making custom changes. It's important to be aware of these risks before making any customizations to the platform.

1. Security risks: Custom changes to the platform may inadvertently introduce security vulnerabilities.

2. Compatibility issues: Custom changes may not always be fully compatible with future updates to the platform. This could cause conflicts and errors that could affect the platform's functionality and stability.

3. Support limitations: Making custom changes to the platform may limit the support you can receive from the platform's developers.

4. Maintenance overhead: Custom changes require ongoing maintenance and upkeep.

---

### Text Changes

Greenlight v3 provides the ability to customize all of the strings used in the platform's user interface. This means that you can change any text string, including labels, messages, and notifications, to match your organization's preferred terminology or language.

First, find the file that contains the string you would like to change. Language files can be found in 2 places:
1. [app/assets/locales](https://github.com/bigbluebutton/greenlight/tree/v3/app/assets/locales)
2. [config/locales](https://github.com/bigbluebutton/greenlight/tree/v3/config/locales)

For this example, we will be using `en.json` from `app/assets/locales/`, but you can make the changes to any file.

Once you have located the file containing the string you want to modify, copy it into your greenlight-v3 directory and edit it as needed.

Then, edit the docker compose file so that your new file is loaded into the container. To do that, add a line in the `volumes` section.

```yaml
 volumes:
  - ./data/greenlight-v3/storage:/usr/src/app/storage
  - ./en.json:/usr/src/app/app/assets/locales/en.json
```
OR
```yaml
 volumes:
  - ./data/greenlight-v3/storage:/usr/src/app/storage
  - ./en.json:/usr/src/app/config/locales/en.json
```

Finally, restart Greenlight v3 and your new changes should be displayed in Greenlight.

### Code Changes

Customizing the code in Greenlight v3 can provide even greater flexibility and control over the platform's behavior. However, modifying the code can also be complex, and it carries a greater risk of introducing errors or compatibility issues.

If you decide to customize the code, it's important to have a solid understanding of Ruby on Rails and React, the frameworks used to build Greenlight v3. You should also be familiar with the structure of the Greenlight v3 codebase and its dependencies.

First, find the file that you would like to change by searching through the [Greenlight repository](https://github.com/bigbluebutton/greenlight/tree/v3).

Once you have located the file that you want to modify, copy it into your greenlight-v3 directory and edit it as needed.

For this example, we will be using `rooms_controller.rb` from `app/controllers/api/v1/`, but you can make the changes to any file.

Then, edit the docker compose file so that your new file is loaded into the container. To do that, add a line in the `volumes` section.

```yaml
 volumes:
  - ./data/greenlight-v3/storage:/usr/src/app/storage
  - ./rooms_controller.rb:/usr/src/app/app/controllers/api/v1/rooms_controller.rb
```

Finally, restart Greenlight v3 and your new changes should be displayed in Greenlight.
