---
id: config
slug: /greenlight/v2/config
title: Configuration
sidebar_position: 3
description: Greenlight Configuration
keywords:
- greenlight
- configuration
---

## Configuring Greenlight 2.0

Greenlight is a highly configurable application. The various configuration options can be found below. When making a changes to the `.env` file, in order for them to take effect you must restart you Greenlight container. For information on how to do this, see [Applying `.env` Changes](#applying-env-changes).

### Using a Different Relative Root

By default Greenlight is deployed to the `/b` subdirectory. If you are running Greenlight on a BigBlueButton server you must deploy Greenlight to a sub directory to avoid conflicts.

If you with to use a relative root other than `/b`, you can do the following:

1. Change the `RELATIVE_URL_ROOT` environment variable.
1. Update the `/etc/bigbluebutton/nginx/greenlight.nginx` file to reflect the new relative root.
1. Restart Nginx and the Greenlight server.

If you are **not** deploying Greenlight on a BigBlueButton server and want the application to run at root, simply set the `RELATIVE_ROOT_URL` to be blank.

### Setting a Custom Branding Image

You can now setup branding for Greenlight through its [Administrator Interface](/greenlight/v2/admin#site-branding).

### User Authentication

Greenlight supports four types of user authentication. You can configure any number of these, and Greenlight will dynamically adjust to which ones are configured.

#### In Application (Greenlight)

Greenlight has the ability to create accounts on its own. Users can sign up with their name, email and password and use Greenlight's full functionality.

By default, the ability for anyone to create a Greenlight account is enabled. To disable this, set the `ALLOW_GREENLIGHT_ACCOUNTS` option in your `.env` file to false. This will **not** delete existing Greenlight accounts, but will prevent new ones from being created.

#### Google OAuth2

You can use your own Google account, but since Greenlight will use this account for sending out emails, you may want to create a Google account related to the hostname of your BigBlueButton server.  For example, if your BigBlueButton server is called `example.myserver.com`, you may want to create a Google account called `greenlight_notifications_myserver`.

You need a Google account to create an OAuth 2 `CLIENT_ID` and `SECRET`.  The will enable users of Greenlight to authenticate with their own Google account (not yours).

Login to your Google account, and click the following link

  [https://console.developers.google.com/](https://console.developers.google.com/)

If you want to see the documentation behind OAuth2 at Google, click the link [https://developers.google.com/identity/protocols/OAuth2](https://developers.google.com/identity/protocols/OAuth2).

First, create a Project click the "CREATE" link.

In the menu on the left, click "Credentials".

Next, click the "OAuth consent screen" tab below the "Credentials" page title.

From here take the following steps:
1. Choose any application name e.g "Greenlight"
2. Set "Authorized domains" to your hostname eg "hostname" where hostname is your hostname
3. Set "Application Homepage link" to your hostname e.g "http://hostname/b/" where hostname is your hostname
4. Set "Application Privacy Policy link" to your hostname e.g "http://hostname/b/" where hostname is your hostname
5. Click "Save"

Next,

1. Click "Create credentials"
2. Select "OAuth client ID"
3. Select "Web application"
4. Choose any name e.g “bbb-endpoint”
5. Under "Authorized redirect URIs" enter "https://hostname/b/auth/google/callback" where hostname is your hostname
6. Click "Create"

A window should open with your OAuth credentials. In this window, copy client ID and client secret to the `.env` file so it resembles the following (your credentials will be different).

```
GOOGLE_OAUTH2_ID=1093993040802-jjs03khpdl4dfasffq7hj6ansct5.apps.googleusercontent.com
GOOGLE_OAUTH2_SECRET=KLlBNy_b9pvBGasf7d5Wrcq
```

The `GOOGLE_OAUTH2_HD` environment variable is optional and can be used to restrict Google authentication to a specific Google Apps hosted domain.

```
GOOGLE_OAUTH2_HD=example.com
```

#### Office365 OAuth2

You will need an Office365 account to create an OAuth 2 key and secret. This will allow Greenlight users to authenticate with their own Office365 accounts.

To begin, head over to the following site and sign in to your Office365 account:
[https://portal.azure.com/](https://portal.azure.com/)

In the menu on the left, click "Azure Active Directory".

Under the "Manage" tab, click "App registrations".

From here take the following steps:
1. Click "New Registration"
2. Choose any application name e.g “bbb-endpoint”
3. Set the Redirect URI to your url (must be https): “https://hostname/b/auth/office365/callback”
4. Click "Register"

Once your application has been created, Under the "Overview" tab, copy your "Application (client) ID" into the `OFFICE365_KEY` environment variable in your `.env` file.

Finally, click the "Certificates & secrets" under the "Manage" tab

From here take the following steps:
1. Click "New client secret"
2. Choose the "Never" option in the "Expires" option list
3. Copy the value of your password into the `OFFICE365_SECRET` environment variable in your `.env` file


#### LDAP Auth

Greenlight is able to authenticate users using an external LDAP server. To connect Greenlight to an LDAP server, you will have to provide values for the environment variables under the 'LDAP Login Provider' section in the `.env` file. You need to provide all of the values for LDAP authentication to work correctly.

> `LDAP_SERVER` is the server host.

> `LDAP_PORT` is the server port (commonly 389).

> `LDAP_METHOD` is the authentication method, either 'plain' (default), 'ssl' or 'tls'.

> `LDAP_UID` is the name of the attribute that contains the user id. For example, OpenLDAP uses 'uid'.

> `LDAP_BASE` is the location to look up users.

> `LDAP_BIND_DN` is the default account to use for user lookup.

> `LDAP_AUTH` is the preferred authentication method. (See below)

> `LDAP_PASSWORD` is the password for the account to perform user lookup.

> `LDAP_ROLE_FIELD` is the name of the attribute that contains the user role. (Optional)

> `LDAP_FILTER` is the filter which can be used to only allow a specific subset of users to authenticate. (Optional)

> `LDAP_ATTRIBUTE_MAPPING` allows you to specify which attributes in your LDAP server match which attributes in Greenlight (Optional - See below)

##### LDAP_AUTH

When setting the authentication method, there are currently 3 options:
- `"simple"`: Uses the account set in `LDAP_BIND_DN` to look up users
- `"user"`: Uses the user's own credentials to search for his data, enabling authenticated login to LDAP without the need for a user with global read privileges.
- `"anonymous"`: Enables an anonymous bind to the LDAP with no password being used.

##### LDAP_ROLE_FIELD

Greenlight can automatically assign a matching role to a user based on their role in the LDAP Server. To do that:
- Create a role in Greenlight with the **exact** same name as the LDAP role
- Set the role permissions for the newly created role
- Repeat for all possible roles
- Set `LDAP_ROLE_FIELD` equal to the name of the attribute that stores the role
- Restart Greenlight

Once you have signed in with that user, they will automatically be given the Greenlight role that matches their LDAP role.

##### LDAP_ATTRIBUTE_MAPPING

When a LDAP user signs into Greenlight, the LDAP gem looks up the LDAP user and stores some information that is passed back to Greenlight.

You can find a list of the defaults in the table below. For rows with multiple attributes, the gem will use the first available attribute starting with the leftmost attribute in the row.

| Variable Name | LDAP Attributes                | Greenlight User Attribute                                       |
|:------------- |:-------------------------------|:----------------------------------------------------------------|
| uid           | dn                             | social_uid - The id used to look the user up (must be unique)   |
| name          | cn, displayName                | name - The user's name                                          |
| email         | mail, email, userPrincipalName | email - The user's email                                        |
| nickname      | uid, userid, sAMAccountName    | username - What's used to sign in                               |
| image         | jpegPhoto                      | image - User's profile image (only works if it's a public link) |

To make changes to the attribute that the gem uses, you can set the `LDAP_ATTRIBUTE_MAPPING` variable in your `.env` using the following format:
`LDAP_ATTRIBUTE_MAPPING=variablename1=ldapattribute1;variablename2=ldapattribute2;variablename3=ldapattribute3;` For any variable that is not set, the default from above will be used.

**IMPORTANT NOTE:** variablename refers to the variable name in the leftmost column above, **NOT** the Greenlight attribute name

For example, if you would like to match the Greenlight users name to `displayName` in your LDAP server and the Greenlight username to `cn` then you would use the following string:

`LDAP_ATTRIBUTE_MAPPING=name=displayName;nickname=cn;`

##### Example Setup

Here are some example settings using an [OpenLDAP](https://www.openldap.org/) server.

```
LDAP_SERVER=host
LDAP_PORT=389
LDAP_METHOD=plain
LDAP_UID=uid
LDAP_BASE=dc=example,dc=org
LDAP_AUTH=simple
LDAP_BIND_DN=cn=admin,dc=example,dc=org
LDAP_PASSWORD=password
LDAP_ROLE_FIELD=userRole
LDAP_FILTER=(&(attr1=value1)(attr2=value2))
```

If your server is still running you will need to recreate the container for changes to take effect.

See [Applying `.env` Changes](#applying-env-changes) section to enable your new configuration.

If you are using an ActiveDirectory LDAP server, you must determine the name of your user id parameter to set `LDAP_UID`. It is commonly 'sAMAccountName' or 'UserPrincipalName'.

LDAP authentication takes precedence over all other providers. This means that if you have other providers configured with LDAP, clicking the login button will take you to the LDAP sign in page as opposed to presenting the general login modal.

#### Twitter OAuth2

Twitter Authentication is deprecated and will be phased out in a future release.


### Setting up File Storage

In order to use Preupload Presentation, you must first make some choices regarding your deployments. If you are upgrading from a version earlier than `2.7`, there are some extra changes needed in order to get it up and running. If you first installed Greenlight at version `2.7` or later, you can skip directly to [Choosing Storage Location](#choosing-storage-location).

#### Updating From Version Prior to 2.7

If you are updating from a version prior to `2.7` you **must** make the following changes inorder for Preupload Presentation to work.

##### Update docker-compose.yml

Using your preferred text editor (examples below will use `nano`), edit the following file:
```bash
nano ~/greenlight/docker-compose.yml
```

Find the following line (Line 19)
```yaml
- ./log:/usr/src/app/log
```
Add the following line **BELOW** the above line (mnking sure to keep the same spacing as the line above)
```yaml
- ./storage:/usr/src/app/storage
```

Once completed, your `docker-compose.yml` should look like this (note the last 2 lines):
```yaml
version: '3'

services:
  app:
    entrypoint: [bin/start]
    image: bigbluebutton/greenlight:v2
    container_name: greenlight-v2
    env_file: .env
    restart: unless-stopped
    ports:
      - 127.0.0.1:5000:80
    volumes:
      - ./log:/usr/src/app/log
      - ./storage:/usr/src/app/storage
```

##### Update NGINX

By default, only files that are < 1 MB are allowed to uploaded due to some NGINX rules. To get around that, you must add a specific rule to large files

Using your preferred text editor (examples below will use `nano`), edit the following file:
```bash
nano /etc/bigbluebutton/nginx/greenlight.nginx
```
At the very bottom, add the following lines (again making sure to keep consistent spacing):
```
## Allow larger body size for uploading presentations
location ~ /preupload_presentation$ {
  client_max_body_size 30m;

  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_http_version  1.1;
}
```

Your file should now look like this:
```
location /b {
  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_http_version  1.1;
}

location /b/cable {
  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_set_header    Upgrade           $http_upgrade;
  proxy_set_header    Connection        "Upgrade";
  proxy_http_version  1.1;
  proxy_read_timeout  6h;
  proxy_send_timeout  6h;
  client_body_timeout 6h;
  send_timeout        6h;
}

## Allow larger body size for uploading presentations
location ~ /preupload_presentation$ {
  client_max_body_size 30m;

  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_http_version  1.1;
}
```

Finally, reload NGINX
```bash
sudo systemctl restart nginx
```

**PLEASE NOTE:** If your Greenlight deployment is deployed **without** the `/b` (or any other relative root), you can skip the remainder of this step

Using your preferred text editor (examples below will use `nano`), edit the following file:
```bash
nano /etc/bigbluebutton/nginx/greenlight.nginx
```

At the very bottom, add the following lines (again making sure to keep consistent spacing):
```
location /rails/active_storage {
  return 301 /b$request_uri;
}
```

Your file should now look like this:
```
location /b {
  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_http_version  1.1;
}

location /b/cable {
  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_set_header    Upgrade           $http_upgrade;
  proxy_set_header    Connection        "Upgrade";
  proxy_http_version  1.1;
  proxy_read_timeout  6h;
  proxy_send_timeout  6h;
  client_body_timeout 6h;
  send_timeout        6h;
}

## Allow larger body size for uploading presentations
location ~ /preupload_presentation$ {
  client_max_body_size 30m;

  proxy_pass          http://127.0.0.1:5000;
  proxy_set_header    Host              $host;
  proxy_set_header    X-Forwarded-For   $proxy_add_x_forwarded_for;
  proxy_set_header    X-Forwarded-Proto $scheme;
  proxy_http_version  1.1;
}

location /rails/active_storage {
  return 301 /b$request_uri;
}
```

Finally, reload NGINX
```bash
sudo systemctl restart nginx
```

#### Choosing Storage Location

When using Preupload Presentation, Greenlight needs a location to store the presentations uploaded by the room owners. At the moment, there are 3 places that you can choose from:
1. Local (Default)
2. Amazon S3
3. Google Cloud Services Cloud Storage

##### Local
By default, local storage is set up to work automatically and will store all files in `~/greenlight/storage`

##### Amazon S3
In order to store files in S3, you must set the following values in your `.env` file. A good guide to follow can be found [here](https://supsystic.com/documentation/id-secret-access-key-amazon-s3/).

> `AWS_ACCESS_KEY_ID` is your AWS Account Access Key (see the guide above)

> `AWS_SECRET_ACCESS_KEY` is your AWS Account Secret Access Key (see the guide above)

> `AWS_REGION` is the region that your S3 bucket is in

> `AWS_BUCKET` is the name of the S3 bucket

##### Google Cloud Services Cloud Storage
In order to store files in Cloud Storage, you must set the following values in your `.env` file.

> `GCS_PROJECT_ID` is the id of the project in which your storage is currently in

> `GCS_PRIVATE_KEY_ID` can be found in the credentials.json file

> `GCS_PRIVATE_KEY` can be found in the credentials.json file

> `GCS_CLIENT_EMAIL` can be found in the credentials.json file

> `GCS_CLIENT_ID` can be found in the credentials.json file

> `GCS_CLIENT_CERT` can be found in the credentials.json file

> `GCS_PROJECT` is the name of the project in which your storage is currently in

> `GCS_BUCKET` is the name of the bucket

### Use PostgreSQL instead of SQLite

Greenlight can be set to use either a local in-memory SQLite database or a production-ready PostgreSQL database.

For any new installs, Greenlight is configured to use PostgreSQL by default.

If you installed Greenlight before v2.5 was released, your deployment is configured to use SQLite by default. If you are using SQLite, we highly recommend that you make the change to PostgreSQL.

#### Converting SQLite database to PostgreSQL without losing data

It is possible to convert an existing SQLite database to PostgreSQL without losing any of your data.

You'll need to generate a random password that will be used in 3 different instances. Generate one by running
```bash
openssl rand -base64 24
```
For the remainder of these instructions, replace **RANDOM_PASSWORD_REPLACE_ME** with the password that was generated with the command from above

First, ensure you are in your Greenlight directory and that Greenlight is not running
```bash
cd ~/greenlight
docker-compose down
```

Second, replace your `docker-compose.yml` with the new `docker-compose.yml` to include the PostgreSQL container
```bash
docker run --rm bigbluebutton/greenlight:v2 cat ./docker-compose.yml > docker-compose.yml
```

Next, edit your `docker-compose.yml` to include your SQLite container (You can use vi, vim, nano or any text editor)
```bash
vim docker-compose.yml
```

There are 3 lines that need to be changed. When making the changes, make sure the spacing remains consistent.

- The first change is removing the `#` before
```yaml
##      - ./db/production:/usr/src/app/db/production
```

- The second change is replacing

  ```yaml
    - ./db/production:/var/lib/postgresql/data
  ```

  With

  ```yaml
    - ./db/production-postgres:/var/lib/postgresql/data
  ```

- The third change is replacing **RANDOM_PASSWORD_REPLACE_ME** with the password you generated in the earlier step


**NOTE:** If you cloned the repository and are building your own image, make sure you also make the change to point to your image instead of the default one. If you are installed using the basic **Install** instructions, you can skip this step.
```
services:
  app:
    entrypoint: [bin/start]
    image: <image name>:release-v2
```

The next step is configuring the `.env` file so that it connects to the PostgreSQL database. Edit your `.env` file
```bash
vim .env
```
and add the following lines to any part of the `.env` file (Making sure to replace the **RANDOM_PASSWORD_REPLACE_ME**)
```
DB_ADAPTER=postgresql
DB_HOST=db
DB_NAME=greenlight_production
DB_USERNAME=postgres
DB_PASSWORD=RANDOM_PASSWORD_REPLACE_ME
```
Next, test your current configuration by running
```bash
docker-compose up -d
```
If you see the following error, it is due to the spacing of your `docker-compose.yml` file. For reference, the spacing should look like [this](https://github.com/bigbluebutton/greenlight/blob/master/docker-compose.yml#L22)
```bash
ERROR: yaml.parser.ParserError: while parsing a block mapping
  in "./docker-compose.yml", line 4, column 3
expected <block end>, but found '<block mapping start>'
  in "./docker-compose.yml", line 23, column 4
```
If no errors appear, continue to the next step.
Once the containers have spun up, we need to create a new database in PostgreSQL to store our data in  (Making sure to replace the **RANDOM_PASSWORD_REPLACE_ME**)
``` bash
docker exec greenlight-v2 psql "postgresql://postgres:RANDOM_PASSWORD_REPLACE_ME@db:5432" -c 'CREATE DATABASE greenlight_production_new'
```
Assuming that worked successfully, the console should output:
```
CREATE DATABASE
```
Finally, copy the SQLite database and convert it to a PostgreSQL database. (Making sure to replace the **RANDOM_PASSWORD_REPLACE_ME**)
```bash
docker exec greenlight-v2 bundle exec sequel -C sqlite:///usr/src/app/db/production/production.sqlite3 postgres://postgres:RANDOM_PASSWORD_REPLACE_ME@db:5432/greenlight_production_new
```
Assuming that worked successfully, the console should output:
```
Databases connections successful
Migrations dumped successfully
Tables created
Begin copying data
.
.
.
Database copy finished in 2.741942643 seconds
```

Finally, edit your `.env` file to point at the new database by replacing the line that we added in the earlier step
```
DB_NAME=greenlight_production
```
With:
```
DB_NAME=greenlight_production_new
```

Now, [restart Greenlight](#applying-env-changes) and you should be good to go.

You can verify that everything went smoothly if you are able to sign into the accounts you had made before starting this process.

#### Errors after migration

If you encounter any errors after the migration, you can very easily switch back to your previous setup by removing the `.env` variables that were added during this switch.

Just remove these lines and restart Greenlight

```
DB_ADAPTER=postgresql
DB_HOST=db
DB_NAME=greenlight_production
DB_USERNAME=postgres
DB_PASSWORD=RANDOM_PASSWORD_REPLACE_ME
```

### Upgrading PostgreSQL versions
Before you begin, please note that this process may take some time for large databases. We recommend you schedule maintenance windows and avoid attempting to do this upgrade quickly.

#### Create a dump of your database
```
cd ~/greenlight
docker exec greenlight_db_1 /usr/bin/pg_dumpall -U postgres -f /var/lib/postgresql/data/dump.sql
docker-compose down
```

#### Create a backup of your database
```
sudo cp -a db db.bak
sudo mv db/production/dump.sql .
sudo rm -r db/
```

#### Switch PostgreSQL versions
Edit your `docker-compose.yml` file
```
nano docker-compose.yml
```

Replace:
```
image: postgres:9.5
```
With:
```
image: postgres:13-alpine
```

#### Import database dump into new database
Start Greenlight
```
docker-compose up -d
```
Wait a couple of seconds and then run:
```
docker exec greenlight_db_1 /usr/local/bin/psql -U postgres -c "DROP DATABASE greenlight_production;"
```
If you get an error stating that "greenlight_production does not exist", wait a few more seconds then try again. (Repeat until successful)

Finally:
```
sudo mv dump.sql db/production/
docker exec greenlight_db_1 /usr/local/bin/psql -U postgres -f /var/lib/postgresql/data/dump.sql
sudo rm db/production/dump.sql
```

Sign in and confirm that all users, rooms and other settings are present and correct.

#### Errors

If you run into any issues, you can always replace your new database with the previous information. To do so, take down Greenlight and edit your `docker-compose.yml` file
```
cd ~/greenlight
docker-compose down
nano docker-compose.yml
```
Replace:
```
image: postgres:13.2-alpine9.5
```
With:
```
image: postgres:9.5
```

Then, replace your current database fold with the back up you made during the upgrade process
```
sudo cp -a db db-new.bak
sudo cp -a db.bak db
```

Start Greenlight and confirm that all users, rooms and other settings are present and correct.

### Improving Greenlight's Performance Under Load

Under heavy load, a single Greenlight server with stock settings might have trouble keeping up with the incoming requests. To improve Greenlight's performance, you can increase the number of workers used by the underlying PUMA server. When increasing the number of workers, it's important to note that the more workers you have, the more memory + CPU usage by Greenlight.

To set the number of workers, add `WEB_CONCURRENCY=1` to your `.env` file.

It is recommended to slowly increment the variable by 1, and then monitoring your server to ensure there is enough memory + CPU to continue. Unless on a **very** strong server, it is recommended to keep the variable <= 3.

### Adding Terms and Conditions

Greenlight allows you to add terms and conditions to the application. By adding a `terms.md` file to `app/config/` you will enable terms and conditions. This will display a terms and conditions page whenever a user signs up (or logs on without accepting yet). They are required to accept before they can continue to use Greenlight.

The `terms.md` file is a [Markdown](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) file, so you can style your terms and conditions as you wish.

To add terms and conditions to your docker container, create a `terms.md` file in the `~/greenlight` directory. Then, add the following volume to your `docker-compose.yml` file.

`- ./terms.md:/usr/src/app/config/terms.md`

## Applying `.env` Changes

After you edit the `.env` file, you are required to restart Greenlight in order for it to pick up the changes.   Ensure you are in the Greenlight directory when restarting Greenlight. To do this, enter the following commands:

### If you installed using the "Install" Instructions
```bash
docker-compose down
docker-compose up -d
```

### If you installed using the "Customize" Instructions
```bash
docker-compose down
./scripts/image_build.sh <image name> release-v2
docker-compose up -d
```

See also
  * [Overview](/greenlight/v2/overview)
  * [Install](/greenlight/v2/install)
  * [Admin Guide](/greenlight/v2/admin)
  * [Customize](/greenlight/v2/customize)
