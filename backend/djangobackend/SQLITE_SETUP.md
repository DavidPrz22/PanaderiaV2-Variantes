# SQLite Setup for PanaderiaSystem

This guide details the setup and usage of the local SQLite database, which replaces the remote PostgreSQL database for development.

## Configuration

The database configuration is controlled by the `USE_SQLITE` environment variable in `.env`.

- **Enable SQLite:**
  ```bash
  USE_SQLITE=True
  ```

- **Enable PostgreSQL:**
  ```bash
  USE_SQLITE=False
  ```

## Setup Instructions

1.  **Environment Setup:**
    ensure `USE_SQLITE=True` is set in your `.env` file.

2.  **Initialize Database:**
    Run migrations to create the database schema:
    ```bash
    python manage.py migrate
    ```

3.  **Load Data:**
    If you have a backup fixture (e.g., `data_backup.json`), load it:
    ```bash
    python manage.py loaddata data_backup.json
    ```

4.  **Create Cache Table:**
    ```bash
    python manage.py createcachetable
    ```

## Backup & Restore

### Backup
To dump the current SQLite database to a JSON file:
```bash
python manage.py dumpdata --exclude auth.permission --exclude contenttypes --natural-foreign --natural-primary --indent 2 > backup.json
```

### Restore
To restore from a JSON file (warning: this may duplicate data if not careful, flush db first if needed):
```bash
python manage.py flush
python manage.py loaddata backup.json
```

## Known Limitations

- **Concurrency:** SQLite has limited concurrency compared to PostgreSQL. WAL mode is enabled to mitigate this.
- **Strict Typing:** SQLite is loosely typed, but Django enforces types.
- **Constraints:** Some advanced PostgreSQL constraints might not behave exactly the same, but conditional constraints are supported (SQLite 3.8+).

## Troubleshooting

- **Database Locked:** If you encounter "database is locked" errors, ensure you are not running long transactions. The timeout is set to 20 seconds.
- **Migration Issues:** If a migration fails, try checking if it relies on PostgreSQL-specific features.
