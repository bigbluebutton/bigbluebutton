#!/bin/bash -e

# Apply settings in environment.
yq write -i ./programs/server/assets/app/config/settings.yml "public.kurento.wsUrl" "${KURENTO_WSURL}"
yq write -i ./programs/server/assets/app/config/settings.yml "public.kurento.enableVideo" "${KURENTO_VIDEO}"
yq write -i ./programs/server/assets/app/config/settings.yml "public.kurento.enableListenOnly" "${KURENTO_LISTEN_ONLY}"
yq write -i ./programs/server/assets/app/config/settings.yml "public.kurento.enableScreensharing" "${KURENTO_SCREENSHARING}"
yq write -i ./programs/server/assets/app/config/settings.yml "public.kurento.chromeExtensionKey" "${SCREENSHARING_EXTENSION_KEY}"
yq write -i ./programs/server/assets/app/config/settings.yml "public.kurento.chromeExtensionLink" "${SCREENSHARING_EXTENSION_LINK}"

node main.js
