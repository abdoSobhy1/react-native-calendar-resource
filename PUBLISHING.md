# Publishing Guide

This guide explains how to publish new versions of the package.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **npm Token**: Generate an access token from your npm account settings
3. **GitHub Repository**: Ensure your repository is set up at https://github.com/abdosobhy1/react-native-calendar-resource

## Setup (One-time)

### 1. Configure npm Token in GitHub

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Your npm access token (from https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
6. Click "Add secret"

### 2. Login to npm locally (for manual publishing)

```bash
npm login
```

## Publishing Process

### Automated Publishing (Recommended)

When you push a version tag, GitHub Actions will automatically:
- Create a GitHub Release
- Publish to npm

**Steps:**

1. Update version in `package.json`:
   ```bash
   npm version patch  # for bug fixes (1.1.0 → 1.1.1)
   npm version minor  # for new features (1.1.0 → 1.2.0)
   npm version major  # for breaking changes (1.1.0 → 2.0.0)
   ```

2. Update `CHANGELOG.md` with the changes

3. Commit the changes:
   ```bash
   git add .
   git commit -m "chore: release v1.x.x"
   ```

4. Push the tag:
   ```bash
   git push origin main --tags
   ```

5. GitHub Actions will automatically:
   - Build the package
   - Create a GitHub Release
   - Publish to npm

### Manual Publishing

If you prefer to publish manually:

1. Update version:
   ```bash
   npm version patch
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Publish:
   ```bash
   npm publish
   ```

4. Create GitHub Release manually or push the tag:
   ```bash
   git push origin main --tags
   ```

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

## Checklist Before Publishing

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated
- [ ] Version number is bumped
- [ ] No uncommitted changes
- [ ] Package builds locally without errors

## Troubleshooting

### "You do not have permission to publish"
- Ensure you're logged in: `npm whoami`
- Check package name availability: `npm view react-native-calendar-resource`
- Verify npm token is set in GitHub Secrets

### "Tag already exists"
- Delete local tag: `git tag -d v1.x.x`
- Delete remote tag: `git push origin :refs/tags/v1.x.x`
- Create new tag with correct version

### GitHub Actions failing
- Check the Actions tab in your repository
- Verify NPM_TOKEN secret is set correctly
- Ensure repository permissions allow Actions to create releases
