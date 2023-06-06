---
id: install
slug: /greenlight/v2/install
title: Installation
sidebar_position: 2
description: Greenlight Installation
keywords:
- greenlight
- install
---

## Installing on a BigBlueButton Server

To make Greenlight as easy to install as possible, we've created a Docker image that wraps the application. It is **highly** recommended that you use Docker when install Greenlight on a BigBlueButton server.

Following this installation process will install Greenlight with the default settings. Through the [Administrator Interface](/greenlight/v2/admin), you can customize the Branding Image, Primary Color and other Site Settings. If you would like to check out the Greenlight source code and make changes to it, follow these [installation instructions](/greenlight/v2/customize#customizing-greenlight)

You should run all commands in this section as `root` on your BigBlueButton server.

### BigBlueButton Server Requirements

Before you install Greenlight, you must have a BigBlueButton server to install it on. This server must:

* have a version of BigBlueButton 2.0 (or greater).
* have a fully qualified hostname.
* have a valid SSL certificate (HTTPS).

### 1. Install Docker

The official Docker documentation is the best resource for Docker install steps. To install Docker (we recommend installing Docker CE unless you have a subscription to Docker EE), see [Install Docker on Ubuntu](https://docs.docker.com/engine/installation/linux/ubuntu/).

Before moving onto the next step, verify that Docker is installed by running:

```bash
docker -v
```

### 2. Install Greenlight

First, create the Greenlight directory for its configuration to live in.

```bash
mkdir ~/greenlight && cd ~/greenlight
```

Greenlight will read its environment configuration from the `.env` file. To generate this file and install the Greenlight Docker image, run:

```bash
docker run --rm bigbluebutton/greenlight:v2 cat ./sample.env > .env
```

### 3. Configure Greenlight

If you open the `.env` file you'll see that it contains information for all of the Greenlight configuration options. Some of these are mandatory.

When you installed in step two, the `.env` file was generated at `~/greenlight/.env`.

#### Generating a Secret Key

Greenlight needs a secret key in order to run in production. To generate this, run:

```bash
docker run --rm bigbluebutton/greenlight:v2 bundle exec rake secret
```

Inside your `.env` file, set the `SECRET_KEY_BASE` option to this key. You don't need to surround it in quotations.

#### Setting BigBlueButton Credentials

By default, your Greenlight instance will automatically connect to `test-install.blindsidenetworks.com` if no BigBlueButton credentials are specified. To set Greenlight to connect to your BigBlueButton server (the one it's installed on), you need to give Greenlight the endpoint and the secret. To get the credentials, run:

```bash
sudo bbb-conf --secret
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
docker run --rm bigbluebutton/greenlight:v2 cat ./greenlight.nginx | sudo tee /etc/bigbluebutton/nginx/greenlight.nginx
```

Verify that the Nginx configuration file (`/etc/bigbluebutton/nginx/greenlight.nginx`) is in place. If it is, restart Nginx so it picks up the new configuration.

```bash
sudo systemctl restart nginx
```

This will routes all requests to `https://<hostname>/b` to the Greenlight application. If you wish to use a different relative root, you can follow the steps outlined [here](/greenlight/v2/config#using-a-different-relative-root).

Optionally, if you wish to have the default landing page at the root of your BigBlueButton server redirect to Greenlight, add the following entry to the bottom of `/etc/nginx/sites-available/bigbluebutton` just before the last `}` character.

```nginx
location = / {
  return 307 /b;
}
```

To have this change take effect, you must once again restart Nginx.

### 5. Start Greenlight 2.0

To start the Greenlight Docker container, you must install `docker-compose`, which simplifies the start and stop process for Docker containers.

Install `docker-compose` by following the steps for installing on Linux in the [Docker documentation](https://docs.docker.com/compose/install/). You may be required to run all `docker-compose` commands using sudo. If you wish to change this, check out [managing docker as a non-root user](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user). Do not install (via `apt-get`) the version of `docker-compose` packaged in Ubuntu is typically outdated.

#### Using `docker-compose`

Before you continue, verify that you have `docker-compose` installed by running:

```bash
cd ~/greenlight
docker-compose -v
```

Next, you should copy the `docker-compose.yml` file from the Greenlight image in to `~/greenlight` directory. To do this, run:

```bash
docker run --rm bigbluebutton/greenlight:v2 cat ./docker-compose.yml > docker-compose.yml
```

Finally, randomly generate a password for the PostgreSQL database and replace the entries in the `.env` and `.docker-compose.yml` file with this command

```bash
export pass=$(openssl rand -hex 24); sed -i 's/POSTGRES_PASSWORD=password/POSTGRES_PASSWORD='$pass'/g' docker-compose.yml;sed -i 's/DB_PASSWORD=password/DB_PASSWORD='$pass'/g' .env
```

Once you have completed these steps, from the `~/greenlight` directory, start the application using:

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

## Updating Greenlight

To update Greenlight, all you need to do is pull the latest image from [Dockerhub](https://hub.docker.com/).

```bash
cd ~/greenlight
docker-compose pull
docker-compose down
docker-compose up -d
```

Once you've updated Greenlight, you should look through the latest version of the `sample.env` file [here](https://github.com/bigbluebutton/greenlight/blob/v2/sample.env), and see if there are any new settings you would like to change or add to Greenlight. If you come across something you want to add, simply copy paste it to the bottom of your `.env` file and then restart Greenlight by running:

```bash
docker-compose down
docker-compose up -d
```

## Switching from `Install` to `Customize`

In the case that you would like to make changes to your code without losing your current data, there are steps you can take to switch from the `Install` version to the `Customize` version without losing any data. 

In the Greenlight directory, take down Greenlight and rename the Greenlight directory to avoid conflicts using these commands:

```bash
docker-compose down
cd ..
mv greenlight/ greenlight-old/
```

Then, install Greenlight by following the `Customize` instructions [here](/greenlight/v2/customize#customizing-greenlight). Don't worry about any of the `.env` configuration, as it will be overwritten by the version you are currently using.

Copy over your database file and `.env` file using these commands:

```bash
cp ~/greenlight-old/.env ~/greenlight/.env
sudo cp -r ~/greenlight-old/db ~/greenlight/
```

Finally, restart Greenlight with:

```bash
cd ~/greenlight
docker-compose down
docker-compose up -d
```

## Troubleshooting Greenlight

Sometimes there are missteps and incompatibility issues when setting up applications.

### Checking the Logs

The best way for determining the root cause of issues in your Greenlight application is to check the logs.

Docker is always running on a production environment, so the logs will be located in `log/production.log` from the `~/greenlight` directory.

## Uninstall

If you would like to uninstall Greenlight, you can do so by running the following commands: 

**NOTE:** This will **permanently** delete all data associated with Greenlight. This data can not be recovered.

```bash
cd ~/greenlight
docker-compose down
docker rmi bigbluebutton/greenlight:v2
cd ../
sudo rm -rf greenlight/
```

See also

* [Overview](/greenlight/v2/overview)
* [Admin Guide](/greenlight/v2/admin)
* [Customize](/greenlight/v2/customize)
* [Configure](/greenlight/v2/config)
