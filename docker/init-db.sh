#!/bin/bash
set -e

echo "Configuring PostgreSQL authentication..."

# Update pg_hba.conf to use md5 authentication
echo "host all all all md5" >> "$PGDATA/pg_hba.conf"

echo "PostgreSQL authentication configured successfully"
