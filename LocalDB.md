# Local SQLite Database Implementation Plan

## Objective
Migrate the PanaderiaSystem backend from remote PostgreSQL (Neon) to a local SQLite database for the `sqliteDB` branch, ensuring all operations work seamlessly with the local database.

---

## Phase 1: Database Configuration Setup

### 1.1 Update Django Settings
**File:** `backend/djangobackend/djangobackend/settings.py`

- [ ] Create a new database configuration for SQLite
- [ ] Add environment variable to toggle between SQLite and PostgreSQL
- [ ] Configure SQLite database path in `BASE_DIR`
- [ ] Update cache backend to use SQLite-compatible settings

**Implementation:**
```python
# Add to settings.py
USE_SQLITE = os.getenv('USE_SQLITE', 'False').lower() == 'true'

if USE_SQLITE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Existing PostgreSQL configuration
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            # ... existing config
        }
    }
```

### 1.2 Update Environment Variables
**File:** `backend/djangobackend/.env`

- [ ] Add `USE_SQLITE=True` to `.env` file
- [ ] Document the new environment variable
- [ ] Create `.env.example` with both configurations

---

## Phase 2: Database Migration & Data Transfer

### 2.1 Export Data from Remote PostgreSQL

**Option A: Using Django's dumpdata (Recommended)**
- [ ] Export all data to JSON fixture
  ```bash
  python manage.py dumpdata --natural-foreign --natural-primary --indent 2 > data_backup.json
  ```
- [ ] Exclude sessions and contenttypes if needed
  ```bash
  python manage.py dumpdata --exclude auth.permission --exclude contenttypes --natural-foreign --natural-primary --indent 2 > data_backup.json
  ```

**Option B: Using pg_dump + conversion**
- [ ] Export PostgreSQL database to SQL dump
- [ ] Use conversion tool (e.g., `pgloader`) to convert to SQLite format

### 2.2 Initialize SQLite Database
- [ ] Set `USE_SQLITE=True` in `.env`
- [ ] Run migrations on SQLite
  ```bash
  python manage.py migrate
  ```
- [ ] Create cache table
  ```bash
  python manage.py createcachetable
  ```
- [ ] Create superuser
  ```bash
  python manage.py createsuperuser
  ```

### 2.3 Import Data to SQLite
- [ ] Load the JSON fixture
  ```bash
  python manage.py loaddata data_backup.json
  ```
- [ ] Verify data integrity
- [ ] Check foreign key relationships
- [ ] Validate record counts match

---

## Phase 3: Code Compatibility Adjustments

### 3.1 Review Database-Specific Features
- [ ] **Check for PostgreSQL-specific fields:**
  - JSONField (should work in Django 3.1+)
  - ArrayField (needs replacement or removal)
  - HStoreField (needs replacement)
  
- [ ] **Review raw SQL queries:**
  - Search for `connection.cursor()` usage
  - Check for PostgreSQL-specific SQL syntax
  - Update any `RETURNING` clauses (not supported in SQLite)

- [ ] **Check for database functions:**
  - PostgreSQL-specific aggregations
  - Custom database functions
  - Full-text search features

### 3.2 Update Constraint Handling
**File:** `backend/djangobackend/apps/core/models.py`

- [ ] Review `UniqueConstraint` with conditions (SQLite 3.8.0+ required)
- [ ] Test constraint behavior in SQLite
- [ ] Update if using PostgreSQL-specific constraint features

### 3.3 Transaction Handling
- [ ] Review atomic transactions
- [ ] Test concurrent operations (SQLite has limited concurrency)
- [ ] Add database locks if needed for critical operations

---


## Phase 5: Documentation & Deployment

### 5.1 Update Documentation
- [ ] Document SQLite setup process
- [ ] Add troubleshooting guide
- [ ] Document known limitations
- [ ] Update README with branch-specific instructions

### 5.2 Create Management Commands
- [ ] Create command to export data: `python manage.py export_to_sqlite`
- [ ] Create command to import data: `python manage.py import_from_postgres`
- [ ] Create command to verify data integrity

### 5.3 Backup Strategy
- [ ] Document SQLite backup process
- [ ] Create automated backup script
- [ ] Test database restoration

---

## Phase 6: Known Limitations & Workarounds

### 6.1 SQLite Limitations to Address
- [ ] **Concurrency:** SQLite locks entire database for writes
  - **Workaround:** Minimize long-running transactions
  - **Workaround:** Use `timeout` parameter in database config
  
- [ ] **ALTER TABLE limitations:** Can't drop columns easily
  - **Workaround:** Plan migrations carefully
  - **Workaround:** Use `--fake` for problematic migrations
  
- [ ] **No RIGHT JOIN or FULL OUTER JOIN**
  - **Workaround:** Rewrite queries using LEFT JOIN
  
- [ ] **Case-sensitive LIKE by default**
  - **Workaround:** Use `icontains` in Django ORM

### 6.2 Performance Considerations
- [ ] Add indexes for frequently queried fields
- [ ] Enable WAL mode for better concurrency:
  ```python
  # In settings.py
  DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.sqlite3',
          'NAME': BASE_DIR / 'db.sqlite3',
          'OPTIONS': {
              'timeout': 20,
              'init_command': 'PRAGMA journal_mode=WAL;',
          }
      }
  }
  ```

---

## Rollback Plan

### If Issues Arise:
1. [ ] Set `USE_SQLITE=False` in `.env`
2. [ ] Restart Django server
3. [ ] Verify connection to PostgreSQL
4. [ ] Document issues encountered
5. [ ] Create GitHub issue for tracking

---

## Success Criteria

- ✅ All Django migrations run successfully on SQLite
- ✅ All existing data transferred without loss
- ✅ All CRUD operations work correctly
- ✅ All unit tests pass
- ✅ Frontend can interact with backend normally
- ✅ No PostgreSQL-specific code remains active
- ✅ Performance is acceptable for development use
- ✅ Database file size is reasonable

---

## Timeline Estimate

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Configuration | 30 minutes |
| Phase 2: Migration | 1-2 hours |
| Phase 3: Code Adjustments | 2-4 hours |
| Phase 4: Testing | 2-3 hours |
| Phase 5: Documentation | 1 hour |
| **Total** | **6-10 hours** |

---

## Next Steps

1. Start with Phase 1: Update settings.py
2. Test configuration with empty SQLite database
3. Proceed to data migration
4. Iteratively test and fix issues
