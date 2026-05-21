# Branch Strategy Workflow

This repository uses a **Git Flow-inspired branch strategy** for development and deployment.

## Branch Structure

### Main Branch (`main`)
- **Purpose**: Production-ready code
- **Protection**: Require pull requests (see below)
- **CI/CD**: Runs tests + deploys to GitHub Pages
- **Deployment**: Automatic deployment on merge

### Development Branch (`develop`)
- **Purpose**: Active development and testing
- **CI/CD**: Runs tests only (no deployment)
- **Deployment**: None (manual testing only)

### Feature Branches
- **Purpose**: Feature development and bug fixes
- **Naming**: `feature/feature-name` or `fix/bug-description`
- **Creation**: From `develop` branch
- **Merge**: Pull request to `develop` branch

## Workflow

### Development Workflow

1. **Create feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/new-feature
   ```

2. **Make changes** and commit:
   ```bash
   git add .
   git commit -m "Add new feature"
   ```

3. **Push feature branch**:
   ```bash
   git push -u origin feature/new-feature
   ```

4. **Create Pull Request** from `feature/new-feature` to `develop`

5. **Run CI/CD** automatically:
   - Linting, type checking, tests
   - No deployment to production

6. **After approval**, merge PR to `develop`

7. **Update `develop`** branch:
   ```bash
   git checkout develop
   git pull
   ```

### Production Deployment Workflow

1. **Merge `develop` into `main`**:
   ```bash
   git checkout main
   git pull
   git merge develop
   git push
   ```

2. **Or create Pull Request** from `develop` to `main`

3. **CI/CD Pipeline runs**:
   - Full test suite
   - Build application
   - **Deploy to GitHub Pages** (https://tomwrighttbwa.github.io/devin-app/)

## Branch Protection Rules

### Required GitHub Settings

**Main Branch Protection** (Settings → Branches → main):

1. **Require pull request before merging**
   - Prevents direct pushes to main
   - Ensures code review

2. **Require status checks to pass before merging**
   - Linting must pass
   - Tests must pass
   - Type checking must pass

3. **Require conversation resolution**
   - At least 1 approval required
   - Dismiss stale PRs automatically

4. **Require branches to be up to date**
   - Ensures no merge conflicts

5. **Restrict who can push**
   - Only administrators (you and trusted team members)

### Implement Branch Protection

1. Go to repository **Settings** → **Branches** → **main**
2. Click **Add rule**
3. Configure the above requirements
4. Click **Create**

## Current Branch Status

- ✅ `main` branch: Production (auto-deploys)
- ✅ `develop` branch: Development (tests only)
- ✅ CI/CD: Configured for both branches
- ⏳ Branch protection: Need to configure in GitHub settings

## Quick Reference

```bash
# Start new feature
git checkout develop && git pull
git checkout -b feature/my-feature

# Push to remote
git push -u origin feature/my-feature

# Test and merge to develop
# (Create PR on GitHub)

# Deploy to production
git checkout main && git pull
git merge develop && git push
```

## CI/CD Pipeline Behavior

| Branch | Lint/Test | Build | Deploy to GitHub Pages |
|--------|-----------|-------|------------------------|
| `develop` | ✅ Yes | ✅ Yes | ❌ No |
| `main` | ✅ Yes | ✅ Yes | ✅ Yes (automatic) |
| `feature/*` | ✅ Yes (via PR) | ✅ Yes (via PR) | ❌ No |

This ensures:
- **Fast feedback** on develop branch (no deployment delay)
- **Production safety** (only deployed after full review)
- **No accidental deployments** from development work