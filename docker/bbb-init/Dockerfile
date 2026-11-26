# The PostgreSQL image of docker-compose.yml, so that psql matches the server
FROM postgres:16.15-trixie@sha256:9e2cf6287f25c3151f4c9421ccce2b17f3e60061c111a29165e0d2cdd9ff0a97

# The schemas of the same commit as the bbb-graphql-server and bbb-shared-notes-server images, at the package paths
COPY --from=graphql-server bbb_schema.sql /usr/share/bbb-graphql-server/
COPY --from=shared-notes-server blocknote_schema.sql /usr/share/bbb-shared-notes-server/
COPY --chmod=0755 init.sh /usr/local/bin/bbb-init.sh

# Runs as root: it creates the data directories and gives them to bigbluebutton (998)
CMD ["bbb-init.sh"]
