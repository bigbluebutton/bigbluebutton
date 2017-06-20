#!/bin/bash

# Change to start meteor in production or development mode
ENVIRONMENT_TYPE=development

ROOT_URL=http://127.0.0.1/html5client NODE_ENV=$ENVIRONMENT_TYPE meteor

