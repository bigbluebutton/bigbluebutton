-- Recreates the BigBlueButton databases, as the bare-metal package scripts do on every
-- install and upgrade:
--   build/packages-template/bbb-graphql-server/after-install.sh (bbb_graphql, hasura_app,
--   roles hasura_app, bbb_core, bbb_hasura) and
--   build/packages-template/bbb-shared-notes-server/after-install.sh (blocknote_app).
-- Run by bbb-db-init as the superuser, connected to the postgres database, with
--   -v ON_ERROR_STOP=1 -v bbb_version=<version of the image>
-- Roles are created without a password if missing and never dropped; passwords.sql sets the
-- passwords. Other databases are not touched.

-- Roles (after-install.sh: CREATE USER only when pg_roles has no such role)
SELECT format('CREATE ROLE %I LOGIN', r)
FROM unnest(ARRAY['hasura_app', 'bbb_core', 'bbb_hasura', 'blocknote_app']) AS r
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = r)
\gexec

-- bbb_graphql: BBB's meeting data, read and written by akka-apps (bbb_core) and read by
-- Hasura (bbb_hasura)
DROP DATABASE IF EXISTS bbb_graphql WITH (FORCE);
CREATE DATABASE bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8';
ALTER DATABASE bbb_graphql SET timezone TO 'UTC';

-- hasura_app: Hasura's metadata database
DROP DATABASE IF EXISTS hasura_app WITH (FORCE);
CREATE DATABASE hasura_app OWNER hasura_app;

-- blocknote_app: shared notes
DROP DATABASE IF EXISTS blocknote_app WITH (FORCE);
CREATE DATABASE blocknote_app OWNER blocknote_app;

GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core;
GRANT CONNECT ON DATABASE bbb_graphql TO bbb_hasura;

\connect bbb_graphql
\i /usr/share/bbb-graphql-server/bbb_schema.sql
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura;

\connect blocknote_app
\i /usr/share/bbb-shared-notes-server/blocknote_schema.sql

-- Marker: the image version these databases were created by. Written last, so an interrupted
-- run is repeated in full by the next one. bbb-db-init compares it with its own version.
\connect postgres
CREATE TABLE IF NOT EXISTS public.bbb_db_init (
    id boolean PRIMARY KEY DEFAULT true CHECK (id),
    version text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.bbb_db_init (version) VALUES (:'bbb_version')
ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version, applied_at = EXCLUDED.applied_at;
