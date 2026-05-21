# Branch Strategy

## Overview
This project uses a Git flow-inspired branching strategy to ensure code quality and controlled deployments.

## Branch Structure

### Main Branches
- **main**: Production-ready code, deployed to GitHub Pages
- **develop**: Integration and development branch

### Workflow
1. **Feature branches**: Created from `develop` for specific features or fixes (e.g., `fix/calculator-bug`, `feature/new-functionality`)
2. **Development work**: All changes should be done on `develop` or feature branches
3. **Pull requests**: Changes must go through PRs for review before merging to `main`
4. **Deployment**: Only PRs to `main` trigger GitHub Pages deployment

## Branch Protection Rules

### Required Configuration
To enforce the workflow, configure these rules in GitHub Settings → Branches:

#### Main Branch Protection:
- ✅ **Require pull request before merging** (Required)
- ✅ **Require status checks to pass before merging** (Recommended)
  - Lint, Type Check, and Tests
- ✅ **Require approval from at least 1 reviewer** (Recommended)
- ✅ **Restrict who can push** - Only maintainers (Optional but recommended)
- ✅ **Require conversation resolution before merging** (Recommended)

#### Develop Branch:
- ✅ **Require pull request before merging** (Optional but recommended for teams)
- ✅ **Require status checks to pass before merging** (Recommended)

## Development Workflow

### For Bug Fixes:
1. Create branch from `develop`: `git checkout -b fix/issue-description`
2. Make your changes
3. Commit with clear messages
4. Push to origin: `git push origin fix/issue-description`
5. Create PR from `fix/issue-description` → `develop`
6. Get review and approval
7. Merge to `develop`
8. Create PR from `develop` → `main` for production deployment

### For New Features:
1. Create branch from `develop`: `git checkout -b feature/new-feature`
2. Develop and test locally
3. Commit regularly with clear messages
4. Push to origin: `git push origin feature/new-feature`
5. Create PR from `feature/new-feature` → `develop`
6. Get review and approval
7. Merge to `develop`
8. Create PR from `develop` → `main` for production deployment

### For Hotfixes (Rare):
1. Create branch from `main`: `git checkout -b hotfix/critical-issue`
2. Make minimal changes
3. Push to origin
4. Create PR from `hotfix/critical-issue` → `main`
5. Get review and fast approval
6. Merge to `main`
7. Merge back to `develop` to keep branches in sync

## CI/CD Pipeline

### Automatic Actions
- **Lint & Test**: Runs on all branches
- **Build**: Runs on all branches
- **Deploy**: Only runs on PR merge to `main`

### Deployment Conditions
- Only deploys when PR to `main` is approved and merged
- Requires all status checks to pass (lint, tests, build)
- Uses official GitHub Pages deployment actions

## Important Notes

- ❌ **Never push directly to `main`** - Always use PRs
- ✅ **Always work on `develop` or feature branches**
- ✅ **Get code reviews** before merging to production
- ✅ **Ensure all tests pass** before requesting review
- ✅ **Write clear commit messages** explaining the "why" not just the "what"

## Benefits
- Code quality through peer review
- Testing in development before production
- Controlled, tracked deployments
- Easy rollback if issues discovered
- Team collaboration and knowledge sharing
