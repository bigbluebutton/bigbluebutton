FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build

WORKDIR /app
COPY package.json package-lock.json ./
# The bundler is a devDependency
RUN npm ci
COPY . .
RUN npm run build

# Only the files, at the path of the bbb-learning-dashboard package
# (build/packages-template/bbb-learning-dashboard/build.sh). The nginx image serves them with the
# package's location file; compose mounts this image there as an image volume.
FROM scratch

COPY --from=build /app/build /var/bigbluebutton/learning-dashboard
