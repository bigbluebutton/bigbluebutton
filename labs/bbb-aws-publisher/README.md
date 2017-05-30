bbb-aws-publisher
=================

This is a utility to upload and host recordings to Amazon's S3. It can run as a service,
listening for events on redis and uploading/updating the recordings automatically, or as a standalone
command that will scan the local recordings and upload/update them.

It deals with publishing, unpublishing and deleting of recordings by setting proper permissions in
the files in S3.

By default, the playback page is hosted on BigBlueButton and the media on S3. There's also an option
to host the playback page also on S3 with the media.


Setup
-----


## Install the application

Sign into your server and run:

```bash
cd ~
git clone https://github.com/bigbluebutton/bigbluebutton.git
cd bigbluebutton/labs/bbb-aws-publisher/
bundle package --all
cd ..
sudo cp -r bbb-aws-publisher /usr/share/
sudo ln -s /usr/share/bbb-aws-publisher/bin/bbb-aws-publisher /usr/bin/bbb-aws-publisher
sudo chmod +x /usr/bin/bbb-aws-publisher
```

Create a local configuration file and edit it with your information:

```bash
sudo touch /usr/share/bbb-aws-publisher/.env.local
sudo vim /usr/share/bbb-aws-publisher/.env.local
chown tomcat7:tomcat7 /usr/share/bbb-aws-publisher/.env.local
```

You will need the configure at least your AWS credentials. See `/usr/share/bbb-aws-publisher/.env`
for all available options. Copy the ones you need to `.env.local` and change their value.

## Setup your S3 bucket

You can either do it manually or using `bbb-aws-publisher`:

```bash
sudo bbb-aws-publisher --setup-bucket
```

To do it manually, go to your acount on [AWS](https://aws.amazon.com) and create a bucket on S3.

Go to the "Properties" tab in your bucket and enable "Static website hosting", so that the objects
can be accessed via URL.

To allow the files on S3 to be accessed by other domains (for when the playback page is hosted with BigBlueButton), your bucket needs the proper CORS configuration.
Go to "Permissions", then "CORS configuration" and use the following configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

## Try it

Test it with:

```bash
BBB_AWS_DEBUG=1 bbb-aws-publisher --watch
```

If it doesn't break nor tell you that your AWS credentials are wrong, you're good to go.

For more information, the logfile is at `/var/log/bigbluebutton/bbb-aws-recorder.log`.


Configuration
=============

The application reads its configurations in the following order:

* Environment variables
* Variables in `.env.local`
* Variables in `.env`

So environment variables override all others, while `.env.local` takes precedence over `.env`.
Do not change `.env`, use always `.env.local.` or environment variables.

If you're running the application as a service, just edit `.env.local` with your configurations.

If you're running the application as a standalone application, it's sometimes easier to provide
the options via environment variables, but you can also edit `.env.local`.


Running as a service
====================

```bash
sudo cp /usr/share/bbb-aws-publisher/config/bbb-aws-publisher.service /usr/lib/systemd/system/
```

Start the service:

```bash
sudo systemctl start bbb-aws-publisher.service
```

Running as standalone application
=================================

To run a one-time command use the utility `bbb-aws-publisher`.

## Synchronize recordings

This will upload, publish, unpublish and delete recordings on S3 according to
the metadata files stored locally.

You can run it once or set it in a cronjob file so that it runs periodically
to sychronize the recordings throughout the day.

```bash
sudo bbb-aws-publisher --resync
```

## Upload the playback files

```bash
sudo bbb-aws-publisher --upload-playback
```

## Setup the bucket

This will create and setup a bucket on Amazon S3.

```bash
sudo bbb-aws-publisher --setup-bucket
```

## Run the watch/daemon mode (listen to redis and react to events)

```bash
sudo bbb-aws-publisher --watch
```

## Other use cases

### Upload recordings but keep the local ones for backup

```bash
sudo bbb-aws-publisher --resync BBB_AWS_KEEP_FILES=1
```

To also not delete from S3 recordings deleted locally:

```bash
sudo bbb-aws-publisher --resync BBB_AWS_KEEP_FILES=1 BBB_AWS_KEEP_DELETED=1
```

### Move both the playback page and the media files to S3

```bash
sudo bbb-aws-publisher --upload-playback
sudo bbb-aws-publisher --resync BBB_AWS_REMOTE_PLAYBACK=1
```

## Running on docker

Start by [installing docker](https://docs.docker.com/engine/installation/).

Open redis to external IPs by editing `/etc/redis/redis.conf` and changing the `bind` command to:

```
bind 0.0.0.0
```

Build the docker image:

```
cd /usr/share/bbb-aws-publisher
docker build -t bbb-aws-publisher .
```

Run it:

```
docker run -it --rm -e BBB_AWS_REGION=sa-east-1 -e BBB_AWS_KEY="MY_AWS_KEY" -e BBB_AWS_SECRET="MY_AWS_SECRET" -e BBB_AWS_BUCKET=my-bucket -e BBB_AWS_REDIS_HOST=`ifconfig docker0 | grep 'inet addr:' | cut -d: -f2 | awk '{print $1}'` -v /var/bigbluebutton:/var/bigbluebutton -v /var/log/bigbluebutton:/var/log/bigbluebutton bbb-aws-publisher
```
