#!/bin/bash
# Backup SQLite database

# Ensure we are in the correct directory
cd "$(dirname "$0")"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
DB_FILE="db.sqlite3"
PYTHON_EXEC="../../env/bin/python"

mkdir -p $BACKUP_DIR

echo "Creating JSON backup..."
# Using Django dumpdata (safer for data portability)
$PYTHON_EXEC manage.py dumpdata --exclude auth.permission --exclude contenttypes --exclude sessions --natural-foreign --natural-primary --indent 2 > "$BACKUP_DIR/data_backup_$TIMESTAMP.json"

echo "Creating DB file backup..."
# Also copying the sqlite file (faster restore, same version req)
if [ -f "$DB_FILE" ]; then
    cp $DB_FILE "$BACKUP_DIR/db_$TIMESTAMP.sqlite3"
else
    echo "Warning: $DB_FILE not found!"
fi

echo "Backup created in $BACKUP_DIR"
echo "  - JSON: $BACKUP_DIR/data_backup_$TIMESTAMP.json"
echo "  - DB:   $BACKUP_DIR/db_$TIMESTAMP.sqlite3"
