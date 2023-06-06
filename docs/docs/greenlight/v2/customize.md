---
id: customize
slug: /greenlight/v2/customize
title: Customizing
sidebar_position: 5
description: Greenlight Customizing
keywords:
- greenlight
- cutomize
---

## Customizing Greenlight

Greenlight is written in Ruby on Rails.  If you know how Ruby on Rails works, you can easily customize Greenlight to your own needs.

The default install instructions will run Greenlight within docker.  To customize Greenlight, you'll want to checkout the source code and build your own docker image.

### 1. Install Docker

The official Docker documentation is the best resource for Docker install steps. To install Docker (we recommend installing Docker CE unless you have a subscription to Docker EE), see [Install Docker on Ubuntu](https://docs.docker.com/engine/installation/linux/ubuntu/).

Before moving onto the next step, verify that Docker is installed by running:

```bash
docker -v
```

### 2. Install Greenlight

Using your GitHub account, do the following

1. [Fork](https://help.github.com/fork-a-repo/) the Greenlight repository into your GitHub account
2. Clone your repository onto your local machine

After cloning, you'll have the following directory:

```
~/greenlight
```

Confirm that you are working on the master branch.

```bash
cd greenlight
git status
```

You should see

```
On branch master
Your branch is up to date with 'origin/master'.

nothing to commit, working tree clean
```

When you first clone the Greenlight git repository, git will place you, by default, on the `master` branch, which is the latest code for Greenlight.  The release branch for v2 is on the `v2` branch.

The first thing we need to do is to add the remote repository to our local clone.

```bash
git remote add upstream https://github.com/bigbluebutton/greenlight.git
```

You can now check your local list of tracked repositories to verify that the addition worked. You should see at least two results (origin and upstream). The one named "origin" should link to your personal fork and is the repository that you cloned. The second result "upstream" should link to the main Greenlight repository.

```bash
git remote -v
```

After, we need to fetch the most up to date version of the remote repository.

```bash
git fetch upstream
```

You are now ready to create a new branch to start your work and base the new branch off v2

```bash
git checkout -b custom-changes upstream/v2
```

You should now confirm that you are in the correct branch.

```bash
git status

On branch custom-changes
Your branch is up to date with 'upstream/v2'.

nothing to commit, working tree clean
```

### 3. Configure Greenlight

Greenlight will read its environment configuration from the `.env` file. To generate this file, enter `~/greenlight` directory and run:

```bash
cp sample.env .env
```

If you open the `.env` file you'll see that it contains information for all of the Greenlight configuration options. Some of these are mandatory.

#### Generating a Secret Key

Greenlight needs a secret key in order to run in production. To generate this, run:

```bash
docker run --rm bigbluebutton/greenlight:v2 bundle exec rake secret
```

Inside your `.env` file, set the `SECRET_KEY_BASE` option to the **last** line in this command. You don't need to surround it in quotations.

#### Setting BigBlueButton Credentials

By default, your Greenlight instance will automatically connect to `test-install.blindsidenetworks.com` if no BigBlueButton credentials are specified. To set Greenlight to connect to your BigBlueButton server (the one it's installed on), you need to give Greenlight the endpoint and the secret. To get the credentials, run:

```bash
bbb-conf --secret
```

In your `.env` file, set the `BIGBLUEBUTTON_ENDPOINT` to the URL, and set `BIGBLUEBUTTON_SECRET` to the secret.

#### Setting Allowed Hosts

For reasons related to security, you'll also need to specify the domain from which the application will be accessible from.

In your `.env` file, set the `SAFE_HOSTS` to your domain. If Greenlight is accessible at `https://bbb.example.com/b` then `SAFE_HOSTS=bbb.example.com`

#### Configure Specific Settings

Other than the 3 configurations listed above, there are many different options for configuring Greenlight. All possible configurations are listed in the `.env` file.

You can find more info on specific settings that can be configured [here](/greenlight/v2/config).

#### Verifying Configuration

Once you have finished setting the environment variables above in your `.env` file, to verify that you configuration is valid, run:

```bash
docker run --rm --env-file .env bigbluebutton/greenlight:v2 bundle exec rake conf:check
```

If you have configured an SMTP server in your `.env` file, then all four tests must pass before you proceed. If you have not configured an SMTP server, then only the first three tests must pass before you proceed.

### 4. Configure Nginx to Route To Greenlight

Greenlight will be configured to deploy at the `/b` subdirectory. This is necessary so it doesn't conflict with the other BigBlueButton components. The Nginx configuration for this subdirectory is stored in the Greenlight image. To add this configuration file to your BigBlueButton server, run:

```bash
cat ./greenlight.nginx | sudo tee /etc/bigbluebutton/nginx/greenlight.nginx
```

Verify that the Nginx configuration file (`/etc/bigbluebutton/nginx/greenlight.nginx`) is in place. If it is, restart Nginx so it picks up the new configuration.

```bash
systemctl restart nginx
```

This will routes all requests to `https://<hostname>/b` to the Greenlight application. If you wish to use a different relative root, you can follow the steps outlined [here](/greenlight/v2/config#using-a-different-relative-root).

Optionally, if you wish to have the default landing page at the root of your BigBlueButton server redirect to Greenlight, add the following entry to the bottom of `/etc/nginx/sites-available/bigbluebutton` just before the last `}` character.

```
location = / {
  return 307 /b;
}
```

To have this change take effect, you must once again restart Nginx.

### 5. Start Greenlight 2.0

To start the Greenlight Docker container, you must install `docker-compose`, which simplifies the start and stop process for Docker containers.

Install `docker-compose` by following the steps for installing on Linux in the [Docker documentation](https://docs.docker.com/compose/install/). You may be required to run all `docker-compose` commands using sudo. If you wish to change this, check out [managing docker as a non-root user](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user).

#### Using `docker-compose`

Before you continue, verify that you have `docker-compose` installed by running:

```bash
docker-compose -v
```

Once you have verified that it is installed correctly, create your Docker image by running (**image name** can be any name of your choosing):

```bash
./scripts/image_build.sh <image name> release-v2
```

Next, in the `docker-compose.yml` file, replace:

```
services:
  app:
    entrypoint: [bin/start]
    image: bigbluebutton/greenlight:v2
```

With

```
services:
  app:
    entrypoint: [bin/start]
    image: <image name>:release-v2
```

Finally, from the `~/greenlight` directory, start the application using:

```bash
docker-compose up -d
```

This will start Greenlight, and you should be able to access it at `https://<hostname>/b`.

The database is saved to the BigBlueButton server so data persists when you restart. This can be found at `~/greenlight/db`.

All of the logs from the application are also saved to the BigBlueButton server, which can be found at `~/greenlight/log`.

If you don't wish for either of these to persist, simply remove the volumes from the `docker-compose.yml` file.

To stop the application, run:

```bash
docker-compose down
```

#### Using `docker run`

`docker run` is no longer the recommended way to start Greenlight. Please use `docker-compose`.

If you are currently using `docker run` and want to switch to `docker-compose`, follow these [instructions](#switching-from-docker-run-to-docker-compose).

### Making Code Changes

Using the text editor/IDE of choice, you can edit any of the files in the directory. The majority of Greenlight's code lives in `~/greenlight/app`.

You can see an example of how to customize the Landing Page [here](#customizing-the-landing-page).

To see your changes reflected in Greenlight, you will need to [restart Greenlight](#restart-greenlight).

## Restart Greenlight

After you edit the `.env` file or make any change to the code, you are required to rebuild the Greenlight image in order for it to pick up the changes. Ensure you are in the Greenlight directory when restarting Greenlight. To do this, enter the following commands:

```bash
docker-compose down
./scripts/image_build.sh <image name> release-v2
docker-compose up -d
```

## Updating to the Latest Version of Greenlight

If a new version of Greenlight has been released, you'll need to fetch the most up to date version of the remote repository.

```bash
git fetch upstream
```

To merge the code:

```bash
git merge upstream/v2
```

Once you've merged your code, you should look through the latest version of the `sample.env` file [here](https://github.com/bigbluebutton/greenlight/blob/v2/sample.env), and see if there are any new settings you would like to change or add to Greenlight. If you come across something you want to add, simply copy paste it to the bottom of your `.env`, then [restart Greenlight](#restart-greenlight).

## Customizing the Landing Page

### Before you begin

**IMPORTANT**

If you installed using the `bbb-install.sh` script, then you must switch to the [Customize](/greenlight/v2/install#switching-from-install-to-customize) version of Greenlight first, before you proceed.

### Updating the code

A common customization is to modify the default landing page. For a simple change, let's rename the welcome banner to say “Welcome to MyServer”.

The welcome banner is generated by [index.html.erb](https://github.com/bigbluebutton/greenlight/blob/master/app/views/main/index.html.erb).  To customize this message, open `app/views/main/index.html.erb` in an editor.

```erb
<%
## BigBlueButton open source conferencing system - https://www.bigbluebutton.org/.
## Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
## This program is free software; you can redistribute it and/or modify it under the
## terms of the GNU Lesser General Public License as published by the Free Software
## Foundation; either version 3.0 of the License, or (at your option) any later
## version.
#
## BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
## WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
## PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
## You should have received a copy of the GNU Lesser General Public License along
## with BigBlueButton; if not, see <https://www.gnu.org/licenses/>.
%>

<div class="background">
  <div class="container pt-9 pb-8">
    <div class="row">
      <div class="col-md-12 col-sm-12 text-center">
        <h1 id="main-text" class="display-4 mb-4"> <%= t("landing.welcome").html_safe %></h1>
        <p class="lead offset-lg-2 col-lg-8 col-sm-12 "><%= t("landing.about", href: link_to(t("greenlight"), "https://bigbluebutton.org/2018/07/09/greenlight-2-0/", target: "_blank")).html_safe %></p>
        <%= link_to "https://youtu.be/Hso8yLzkqj8", target: "_blank" do %>
          <h4><%= t("landing.video") %> <i class="far fa-play-circle ml-1"></i></h4>
        <% end %>
      </div>

    </div>
  </div>
</div>

<%= render "shared/features" %>
```

This is an Embedded RuBy (ERB) file.   Look for the following line:

```erb
<h1 id="main-text" class="display-4 mb-4"> <%= t("landing.welcome").html_safe %></h1>
```

The function `t("landing.welcome")` retrieves the localized version of the label `landing.welcome`.  For English, this retrieves the string from [en.yml](https://github.com/bigbluebutton/greenlight/blob/master/config/locales/en.yml).  Edit `config/locales/en.yml` and look for the following section:

```yml
  landing:
    about: "%{href} is a simple front-end for your BigBlueButton open-source web conferencing server. You can create your own rooms to host sessions, or join others using a short and convenient link."
    welcome: Welcome to BigBlueButton.
    video: Watch our tutorial on using Greenlight
    upgrade: Show me how to upgrade to 2.0!
    version: We've released a new version of Greenlight, but your database isn't compatible.
```

To change the welcome message, modify the text associated with `landing.welcome` to say "Welcome to MyServer".

```yml
    welcome: Welcome to MyServer
```

Save the change to `en.yml`, and [restart Greenlight](#restart-greenlight).  The welcome message should have the new text.

![Updated login](/img/greenlight/v2/gl-welcome-to-my-server.png)

## Troubleshooting Greenlight

Sometimes there are missteps and incompatibility issues when setting up applications.

### Changes not appearing

If you made changes to the `.env` file, you will need to [restart Greenlight](#restart-greenlight) to see the changes appear.

### Checking the Logs

The best way for determining the root cause of issues in your Greenlight application is to check the logs.

Docker is always running on a production environment, so the logs will be located in `log/production.log` from the `~/greenlight` directory.

See also

* [Overview](/greenlight/v2/overview)
* [Install](/greenlight/v2/install)
* [Admin Guide](/greenlight/v2/admin)
* [Configure](/greenlight/v2/config)
