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
1. Installing alongside a BigBlueButton Server
2. Installing on a Standalone Server

## Installing alongside a BigBlueButton Server
### bbb-install Script
If your server already contains a BigBlueButton server, or you would like to install a new BigBlueButton server along with Greenlight, please refer to [bbb-install script](https://github.com/bigbluebutton/bbb-install).

To install Greenlight, simply run the `bbb-install` command with your chosen configurations, while ensuring that you include `-g` option to include Greenlight.

### Creating an Admin Account
Once installation is complete, you will need to create an Administrator account to access the administrator panel.

You can do that by running the following command:
```bash
docker exec -it greenlight-v3 bundle exec rake admin:create['name','email','password']
```
You can also run it without any arguments to create the default admin account, which you can then either change the password to, or promote your own account to Administrator and then delete the default account.
```bash
docker exec -it greenlight-v3 bundle exec rake admin:create
```


## Installing on a Standalone Server
### Greenlight Install Script
If you're installing Greenlight on a standalone server (ie a server that doesn't include BigBlueButton), we've created an install script to simplify the steps required to get Greenlight up and running.

First, create the Greenlight directory for its configuration to live in.

```bash
mkdir ~/greenlight && cd ~/greenlight
```

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

### Sample Configurations

- Sample options to setup a Greenlight 3.x server with a publicly signed SSL certificate for a FQDN of www.example.com and an email
of info@example.com that uses a BigBlueButton server at bbb.example.com with secret SECRET:

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
You can also run it without any arguments to create the default admin account, which you can then either change the password to, or promote your own account to Administrator and then delete the default account.
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

| Variable Name | Description                                                                                                                           | Default Value |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------|
| OPENID_CONNECT_CLIENT_ID | The client ID of the OpenID issuer  | - |
| OPENID_CONNECT_CLIENT_SECRET | The secret to use to authenticate to the OpenID issuer  | - |
| OPENID_CONNECT_ISSUER | The URL for the OpenID issuer. It is required to be HTTPS URL using the default HTTPS port (TCP 443)  | - |
| OPENID_CONNECT_REDIRECT | The Redirect URI after successful authentication. It should be the URL to Greenlight  | - |

### HCaptcha Setup

| Variable Name | Description                                                                                                                           | Default Value |
|---------------|---------------------------------------------------------------------------------------------------------------------------------------|---------------|
| HCAPTCHA_SITE_KEY | The site key that links to your hCaptcha site  | - |
| HCAPTCHA_SECRET_KEY | The secret to use to authenticate with hCaptcha  | - |

