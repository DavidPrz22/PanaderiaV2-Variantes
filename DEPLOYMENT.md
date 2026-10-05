# Deployment Guide

## CI/CD Pipeline

Automated deployment via GitHub Actions with manual trigger.

### Setup (One-time)

#### 1. Generate SSH Key for GitHub Actions

```bash
# Generate a dedicated key (no passphrase)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Add public key to droplet
cat ~/.ssh/github_actions_deploy.pub | ssh root@165.22.184.244 "cat >> ~/.ssh/authorized_keys"

# Test the key
ssh -i ~/.ssh/github_actions_deploy root@165.22.184.244
```

#### 2. Add Secrets to GitHub

Go to your repo: **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret | Value |
|--------|-------|
| `SSH_PRIVATE_KEY` | Contents of `~/.ssh/github_actions_deploy` (private key) |
| `DROPLET_HOST` | `165.22.184.244` |

#### 3. Verify Setup

```bash
# Test SSH connection from GitHub Actions perspective
ssh -i ~/.ssh/github_actions_deploy root@165.22.184.244 "echo 'Connection successful'"
```

### Deploying

1. Go to **Actions** tab in GitHub
2. Select **"Deploy to Production"** workflow
3. Click **"Run workflow"**
4. Select branch (usually `main`)
5. Type `deploy` in the confirmation box
6. Click **"Run workflow"**

The pipeline will:
- ✅ Run Django tests
- ✅ Build & lint frontend
- ✅ Deploy to droplet (if tests pass)
- ✅ Verify API health

### Monitoring

- **View logs**: Actions tab → click the workflow run → expand jobs
- **Deployment status**: Green check = success, Red X = failure
- **Server logs**: `ssh root@165.22.184.244` then `journalctl -u panaderia -f`

### Rollback

If deployment breaks production:

```bash
# SSH into droplet
ssh root@165.22.184.244

# Check recent commits
cd /srv/panaderia
git log --oneline -5

# Rollback to previous commit
git checkout <commit-hash>

# Redeploy manually
cd backend
source venv/bin/activate
cd djangobackend
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart panaderia
```

Or use GitHub: checkout the previous commit locally, push to main, then trigger the workflow again.

### Pipeline Stages

```
┌─────────────────┐
│  Manual Trigger │
│  (type "deploy")│
└────────┬────────┘
         │
    ┌────▼────┐
    │  Tests  │  (parallel)
    │ Backend │
    │Frontend │
    └────┬────┘
         │
    ┌────▼────┐
    │ Deploy  │
    │  (SSH)  │
    └────┬────┘
         │
    ┌────▼────┐
    │ Health  │
    │  Check  │
    └─────────┘
```

### Troubleshooting

**Tests fail:**
- Check Actions logs for test output
- Run tests locally: `cd backend/djangobackend && python manage.py test`

**Build fails:**
- Check Actions logs for build errors
- Run locally: `cd frontend/panaderia-system && npm run build`

**Deploy fails:**
- Check SSH key is correct
- Verify droplet is accessible: `ssh root@165.22.184.244`
- Check server logs: `journalctl -u panaderia -f`

**Health check fails:**
- API is down after deployment
- Check Gunicorn status: `systemctl status panaderia`
- Check Nginx: `systemctl status nginx`
- Check logs: `journalctl -u panaderia --since "5 minutes ago"`

### Manual Deployment (Emergency)

If CI/CD is broken, deploy manually:

```bash
# SSH into droplet
ssh root@165.22.184.244

# Pull and deploy
cd /srv/panaderia
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd djangobackend
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart panaderia

# Verify
curl -X POST https://panaderiaapiservice.duckdns.org/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{}'
```

### Security Notes

- SSH key is **dedicated** to GitHub Actions (not your personal key)
- Key has **no passphrase** (required for automated deployment)
- Only `root` user on droplet can use this key
- Rotate the key periodically:
  1. Generate new key
  2. Add new public key to droplet
  3. Update GitHub secret
  4. Remove old public key from droplet
