---
id: migration
slug: /greenlight/v3/migration
title: Migration to v3
sidebar_position: 4
description: Greenlight Migration
keywords:
- greenlight
- migration
---

## Migration

Greenlight v3 is a completely new software application with an updated design and architecture.
A migration system has been created to move resources from your Greenlight v2 instance to v3.

**The migration system requires both Greenlight v2 and Greenlight v3 and to be deployed, running and accessible through a network.**

The process intends to migrate the following resources:
- Users
- Roles & Role Permissions
- Rooms & Rooms Settings
- Shared Accesses
- Rooms Configuration
- Site Settings

## How It Works

The migration system consists of multiples **rake tasks** and **a restful API**:

- **The rake tasks are to be executed from the Greenlight v2 deployment.**
- The rake tasks will send the data to the deployed Greenlight v3 server.
- There are four rake tasks: roles, users, rooms and settings. Maintaining this order during the migration is necessary.

- **The migration endpoints are available as long as the Greenlight v3 server is running.**
- The restful API will receive and validate the migrated resources.

## Prerequisites

Before the migration process, make sure that the Greenlight v3 server is running and accessible through your network.

### Updating v2 to the latest version

Before begin your upgrade, it is crucial that you update Greenlight v2 to the latest version. This ensures that you are using the latest version of the migration scripts.

To do so, run the following commands on your v2 machine:

```bash
cd ~/greenlight
docker-compose pull
docker-compose down
docker-compose up -d
```

### Configuring the Environment

In Greenlight v2 **.env** file, add the following variables:
- **V3_ENDPOINT**, which points to your Greenlight v3 URL.
- **V3_SECRET_KEY_BASE**, a copy from Greenlight v3 SECRET_KEY_BASE. It is needed for the encryption process.

![env_migration_endpoints.png](/img/greenlight/v3/migration/env_migration_endpoints.png)

### Understanding the Migrations

**The migrations must be run in the following order: roles, users, rooms, settings.**

The logs will indicate the status of the migrated resources in real-time, in the console.

Upon the successful migration of a resource, a green success message will be displayed in the console.

![success_migration.png](/img/greenlight/v3/migration/success_migration.png)

In case of an error, a red error message will be displayed in the console and should provide some details concerning the error.

![error_migration.png](/img/greenlight/v3/migration/error_migration.png)

However, a failed migration resource should not hinder the whole migration process - the process should not have failed for all the resources.

**If you have an error, try re-running the migration task to resolve any failed resources migration.**

**If re-running the migration does not solve the issue, the error message should give you a clue of what went wrong.**

## Roles Migration

The custom Roles and the corresponding Role Permissions will be migrated.

Please note that:
- The default Roles (user, moderator, guest) will not be migrated as they are already present in Greenlight v3.
- The role color will not be migrated as this feature is not implemented in v3.

**To migrate the Roles & the Role Permissions, run the following command:**
```bash
sudo docker exec -it greenlight-v2 bundle exec rake migrations:roles
```

**If you have an error, try re-running the migration task to resolve any failed resources migration.**
**Also, make sure that the Greenlight v3 server is running and accessible through your network.**

## Users Migration
The Users will be migrated with their corresponding role.

Important notes:
- Both local and external users will be migrated.

### Local Accounts
** If you only have external users (google, office365, LDAP, SAML, etc..), please skip to the next section.** 

When migrating local accounts from GLv2 to GLv3, the password_digest field will be securely transferred from v2 to v3. This ensures that local customers can seamlessly sign in using the exact same password as in v2.

To enable this, it's crucial that both GLv2 and GLv3 share the same value for the SECRET_KEY_BASE environment variable, which is set in the .env file.

Follow these steps:

1. **Retrieve GLv2's `SECRET_KEY_BASE`:**

On your GLv2 machine, execute the following command in the terminal:
```bash
cd ~/greenlight
cat .env | grep SECRET_KEY_BASE
```
Copy the value that is returned.

2. **Update GLv2 `.env` file:**

Edit the .env file on your GLv2 machine and replace the value of `V3_SECRET_KEY_BASE` with the copied value.

3. **Update GLv3 `.env` file:**

On your GLv3 machine, replace the `SECRET_KEY_BASE` in your .env file with the same value that you copied from GLv2.

Ensure that the `SECRET_KEY_BASE` values for GLv2, GLv3, and the `V3_SECRET_KEY_BASE` variable in GLv2's `.env` file are now synchronized.

### Migrating Users

**To migrate all of your v2 users to v3, run the following command:**
```bash
sudo docker exec -it greenlight-v2 bundle exec rake migrations:users
```

**If you have an error, try re-running the migration task to resolve any failed resources migration.**
**Also, make sure that the Roles migration has been successful.**

## Rooms Migration
The Rooms will be migrated with their corresponding Room Settings. Also, the Shared Accesses will be migrated.

Important notes:

- Only the Rooms of the active users will be migrated
- The migrated rooms will be assigned to their respective migrated users on v3
- With the most recent patch releases of Greenlight 2, the presentations will be migrated if present on the source system. However:
  1. If presentations are referenced in the database but *do not* exist on disc they will be ignored.
  2. If this step fails with a `413 Entity too large` error, you need to increase the `client_max_body_size` setting in the nginx reverse proxy of your *Greenlight 3* instance and retry. If you use another reverse proxy, consult your manual about increasing the maximum body size for HTTP requests.

**To migrate the rooms, run the following command:**

```bash
sudo docker exec -it greenlight-v2 bundle exec rake migrations:rooms
```

**If you have an error, try re-running the migration task to resolve any failed resources migration.**
**Also, make sure that the Users migration has been successful.**

## Settings Migration
The Site Settings and the Rooms Configuration will be migrated.

- The *Site Settings* are customisable settings related to the Greenlight application, such as the Brand colors, the Brand image, the Registration method, the Terms & Conditions.

- The *Rooms Configuration* are the settings that are related to the default configuration of all the rooms, such as *Allow Room to be Recorded*, *Allow any User to Start a Meeting*, *Access Codes*.

Please note that:
- The Brand image will not be migrated - it will have to be re-uploaded to Greenlight v3 by the administrator.
- The administrator will need to reassign the Room Limit as a Role Permission (on a per role basis) instead of as a global Site Setting.

**To migrate the settings, run the following command:**

```bash
sudo docker exec -it greenlight-v2 bundle exec rake migrations:settings
```

**If you have an error, try re-running the migration task to resolve any failed resources migration.**

## After the Migration
Having completed the migration successfully, the final step is to import the recordings into v3.

To re-sync the list of recordings, run the following command **on the v3 machine**:

```bash 
sudo docker exec -it greenlight-v3 bundle exec rake server_recordings_sync
```

## Redirect old room urls (optional)

If you want your old users to be able to access rooms via the old rool urls after deactivating greenlight-v2 then you can redirect those requests from /b/ to /rooms/ in order to avoid breaking user experience.

`sudo nano /usr/share/bigbluebutton/nginx/greenlight-v3.nginx`
```bash
# Forward existing rooms from greenlight-v2 to greenlight-v3

location /b/ {
     rewrite ^/b/(.*)$ /rooms/$1 permanent;
}
```

