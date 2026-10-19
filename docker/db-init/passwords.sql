-- Sets the passwords of the BigBlueButton roles from the configuration contract (one secret
-- per role). Bare metal uses fixed passwords equal to the role names
-- (build/packages-template/bbb-graphql-server/after-install.sh,
-- build/packages-template/bbb-shared-notes-server/after-install.sh).
-- Run by bbb-db-init as the superuser. psql reads each password from the environment with
-- \getenv, so it is on no command line and in no file, and :'pw' quotes it as a literal.

-- Keep these statements out of the server log, also if a Tier 3 file enables statement
-- logging (only a superuser may change these settings for the session).
SET log_statement = 'none';
SET log_min_duration_statement = -1;
SET log_min_duration_sample = -1;
SET log_transaction_sample_rate = 0;
SET log_min_error_statement = 'panic';
-- Client side: error messages without the statement text.
\set VERBOSITY terse
\set SHOW_CONTEXT never

\getenv pw POSTGRES_HASURA_APP_PASSWORD
ALTER ROLE hasura_app WITH LOGIN PASSWORD :'pw';
\getenv pw POSTGRES_BBB_CORE_PASSWORD
ALTER ROLE bbb_core WITH LOGIN PASSWORD :'pw';
\getenv pw POSTGRES_BBB_HASURA_PASSWORD
ALTER ROLE bbb_hasura WITH LOGIN PASSWORD :'pw';
\getenv pw POSTGRES_BLOCKNOTE_PASSWORD
ALTER ROLE blocknote_app WITH LOGIN PASSWORD :'pw';
\unset pw
