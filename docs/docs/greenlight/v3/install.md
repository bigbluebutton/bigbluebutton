---
id: install
slug: /greenlight/v3/install
title: Install Greenlight v3
sidebar_position: 1
description: Greenlight Installation
keywords:
- greenlight
- installation
---

## Overview
Greenlight is an open-source, LGPL-3.0 licensed web application that allows organizations to quickly set up a complete web conferencing platform using their existing BigBlueButton server. It is user-friendly for both regular and advanced users.

Greenlight v3, the latest version, is constructed with the cutting-edge versions of Ruby on Rails and React - a robust technology stack adopted by millions of projects and trusted by major corporations worldwide.

Greenlight v3 is equipped with local authentication by default. This means that authentication is managed internally within the platform and does not require any external servers or services. For those who need additional authentication options, Greenlight v3 can be configured to connect to external authentication servers through OpenID Connect. For more information see [External Authentication](/greenlight/v3/external-authentication).

There are 2 ways to install Greenlight v3:
1. [Installing alongside a BigBlueButton Server](#installing-alongside-a-bigbluebutton-server).
2. [Installing on a Standalone Server](#installing-on-a-standalone-server).

## Installing alongside a BigBlueButton Server
### bbb-install Script
If your server already contains a BigBlueButton server that you like to upgrade, or you would like to install a new BigBlueButton server on a clean environment along with Greenlight, then please refer to [bbb-install script](https://github.com/bigbluebutton/bbb-install) for guides on the `bbb-install` command and its options.

To install Greenlight, simply run the `bbb-install` script with your chosen configurations, **while ensuring to include the `-g` option** to install/upgrade Greenlight alongside of your BigBlueButton server.

### Running the Script

To run the script, simply run the command below, replacing `[OPTIONS]`, with the your chosen configurations.

```bash
wget -qO- https://raw.githubusercontent.com/bigbluebutton/bbb-install/v2.7.x-release/bbb-install.sh | bash -s -- [OPTIONS] -g
```

After the script completes, a success message will appear in the console with the URL to access Greenlight confirming that BigBlueButton was installed/upgraded alongside with Greenlight.

### Creating an Admin Account
Once installation is complete, you will need to create an Administrator account to access the administrator panel.

You can do that by running the following command:
```bash
docker exec -it greenlight-v3 bundle exec rake admin:create['name','email','password']
```
You can also run it without any arguments to create the default admin account, which you can either change its password and use, or use it to promote your own account becoming an Administrator and then delete it.
```bash
docker exec -it greenlight-v3 bundle exec rake admin:create
```


## Installing on a Standalone Server
### Greenlight Install Script
If you're installing Greenlight on a standalone server (a server where you don't want to include BigBlueButton), we've created an install script to simplify the steps required to get Greenlight up and running.

The Greenlight Install Script provides you with a variety of options to suit whatever needs you have. Before running the install script, you must choose which options you would like. Here are the current supported options:

```
-s <hostname>            Configure server with <hostname> (Required)

-b <hostname>:<secret>   The BigBlueButton server credentials (bbb-conf --secret) (Required)

-k                       Install Keycloak - needed for external authentication (Optional)

-d                       Skip SSL certificates generation (Required, if -e is omitted).
                         * Certificate files(fullchain.pem, privkey.pem) to be used must be placed in /local/certs/
                         * Cannot be used when -e is used.

-e <email>               Email for Let's Encrypt certbot (Required, if -d is omitted)
                         * Cannot be used when -d is used.
```

And environmental variables:
```
VARIABLES (configure Greenlight):
  GL_PATH                Configure Greenlight relative URL root path (Optional)
                          * Use this when deploying Greenlight behind a reverse proxy on a path other than the default '/' e.g. '/gl'.
```

### Sample Configurations

- Sample options to setup a Greenlight 3.x server with a publicly signed SSL certificate for a FQDN of www.example.com and an email
of info@example.com that uses a BigBlueButton server at `bbb.example.com` with secret `SECRET`:

   `-s www.example.com -e info@example.com -b bbb.example.com:SECRET`

- Sample options to setup a Greenlight 3.x server with pre-owned SSL certificates for a FQDN of www.example.com that uses a BigBlueButton server at bbb.example.com with secret SECRET:

   `-s www.example.com -b bbb.example.com:SECRET -d`

### Running the Script

To run the script, simply run the command below, replacing `[OPTIONS]`, with the values from above.

```bash
wget -qO- https://raw.githubusercontent.com/bigbluebutton/greenlight/master/gl-install.sh | bash -s -- [OPTIONS]
```

After the script finishes running, a success message will appear in the console, confirming that Greenlight v3 is now accessible at the URL specified during installation.

### Creating an Admin Account
Once installation is complete, you will need to create an Administrator account to access the administrator panel.

You can do that by running the following command:
```bash
docker exec -it greenlight-v3 bundle exec rake admin:create['name','email','password']
```
You can also run it without any arguments to create the default admin account, which you can either change its password and use, or use it to promote your own account becoming an Administrator and then delete it.
```bash
docker exec -it greenlight-v3 bundle exec rake admin:create
```

## Optional .env Configurations
### Default Locale Setup

| Variable Name | Description                                                                                                                           | Default Value |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------|
| DEFAULT_LOCALE | The default language for all newly created users. Users will still have the ability to change their language through their profile.  | en |

### Email Setup

SMTP configuration requires following the guidelines provided by your SMTP server's documentation. The specific configuration details will vary based on the SMTP server you are using. It is important to refer to the relevant documentation in order to properly set up SMTP for your needs.

| Variable Name | Description                                                                                                                           | Default Value |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------|
| SMTP_SERVER | The address of the remote mailing server having an open SMTP service.  | - |
| SMTP_PORT | The port on which the SMTP service is accessible through on the remote SMTP_SERVER. Usually, it’s 25 TCP for SMTP and 465 TCP for SMTPS. | - |
| SMTP_USERNAME | The username of the account to use when authenticating to the SMTP_SERVER. | - |
| SMTP_PASSWORD | The password of the account to use when authenticating to the SMTP_SERVER. | - |
| SMTP_AUTH | The authentication type to use to authenticate to the SMTP_SERVER: (plain, login, cram_md5).  | - |
| SMTP_DOMAIN | The domain_name of the SMTP client. Usually, it’s the domain name portion of the SMTP_SENDER_EMAIL FQDN. | - |
| SMTP_SENDER_EMAIL | The email sender address that will appear in the FROM section of the emails. | - |
| SMTP_SENDER_NAME | The email sender name that will appear in the FROM section of the emails. | - |
| SMTP_STARTTLS_AUTO | Automatically chooses between STARTTLS and plain SMTP depending on your SMTP server| true |
| SMTP_STARTTLS | Checks if the SMTP_SERVER supports STARTTLS protocol command and uses it to negotiate an upgrade to SMTPS over the initiated unencrypted connection. | false |
| SMTP_TLS | Use SMTPS when connecting to the SMTP_SERVER. | false |
| SMTP_SSL_VERIFY | Defines whether or not to enable SSL verification on the certificate of the SMTP_SERVER when connecting through SMTPS. | true |

### OpenID Connect Setup

| Variable Name | Description                                                                                         | Default Value |
|---------------|-----------------------------------------------------------------------------------------------------|--------------|
| OPENID_CONNECT_CLIENT_ID | The client ID of the OpenID issuer                                                                  | -            |
| OPENID_CONNECT_CLIENT_SECRET | The secret to use to authenticate to the OpenID issuer                                              | -            |
| OPENID_CONNECT_ISSUER | The URL for the OpenID issuer. It is required to be HTTPS URL using the default HTTPS port (TCP 443) | -            |
| OPENID_CONNECT_REDIRECT | The Redirect URI after successful authentication. It should be the URL to Greenlight                | -            |
| OPENID_CONNECT_UID_FIELD | The field of the user info response to be used as the unique identifier in Greenlight               | 'sub'        |

### HCaptcha Setup

| Variable Name | Description                                                                                                                           | Default Value |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------|
| HCAPTCHA_SITE_KEY | The site key that links to your hCaptcha site  | - |
| HCAPTCHA_SECRET_KEY | The secret to use to authenticate with hCaptcha  | - |

### Relative URL root path (subdirectory) Setup

Greenlight by default will expect being deployed on the root path **/** of your FQDN (Fully qualified domain name).
If having a custom setup and not willing to deploy the application on the root path one could simply run the installation scripts (for more details about the installation options kindly check [Overview](#overview)) with the **GL_PATH** variable set to their chosen configuration and upgrade Greenlight.

> To reflect the relative root path change an upgrade to Greenlight is required.

So, to deploy Greenlight on a relative URL root path of **/gl**:

For systems using [BigBlueButton Install Script](#bbb-install-script) one would simply run **while ensuring to include the -g option**:

```bash
wget -qO- https://raw.githubusercontent.com/bigbluebutton/bbb-install/v2.7.x-release/bbb-install.sh | GL_PATH=/gl bash -s -- [options] -g
```

For systems using [Greenlight Install Script](#greenlight-install-script) one would simply run:

```bash
wget -qO- https://raw.githubusercontent.com/bigbluebutton/greenlight/master/gl-install.sh  | GL_PATH=/gl bash -s -- [options]
```

> Notice the omitting of any trailing slashes in **GL_PATH**.

Alternatively, one could directly update the Greenlight .env file located at `/root/greenlight-v3/.env` and manually set the **RELATIVE_URL_ROOT** variable to match their desired setup and simply re-run afterwards the `bbb-install` command **with the -g option included** but without defining and using the **GL_PATH** variable.

- _We recommend the use of the first approach whenever possible._

> The **GL_PATH** variable on the shell session _(if defined)_ will always be prioritized over the **RELATIVE_URL_ROOT** _(even if the latter is set)_.


| Variable Name | Description                                                                                                                           | Default Value |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------|
| RELATIVE_URL_ROOT | The relative URL root path that Greenlight will be deployed on. This can be used to inform Greenlight to expect traffic relative to a certain path, admins can use this to have a custom deployment of the application meeting their requirements.  | / |

