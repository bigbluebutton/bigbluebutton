Learning Analytics Dashboard will be accessible through https://yourdomain/learning-analytics-dashboard

# Dev Instructions

## Prepare destination directory

```
mkdir -p /var/bigbluebutton/learning-dashboard
chown bigbluebutton /var/bigbluebutton/learning-dashboard/
```

## Build instructions

```
cp .env.example .env
```

```
./deploy.sh
```

## Development instructions

```
cp .env.example .env
```

```
./run-dev.sh
```
