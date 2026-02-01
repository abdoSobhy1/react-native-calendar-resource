# 🚀 Quick Publishing Reference

## First Time Setup

1. **Create npm token** at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. **Add to GitHub**: Settings → Secrets → Actions → New secret
   - Name: `NPM_TOKEN`
   - Value: (your token)

## Publish New Version

```bash
# 1. Update version
npm version patch   # 1.1.0 → 1.1.1 (bug fixes)
npm version minor   # 1.1.0 → 1.2.0 (new features)
npm version major   # 1.1.0 → 2.0.0 (breaking changes)

# 2. Update CHANGELOG.md

# 3. Commit and push with tags
git add .
git commit -m "chore: release v1.x.x"
git push origin main --tags

# ✅ GitHub Actions automatically:
#    - Creates GitHub Release
#    - Publishes to npm
```

## Manual Publish (Alternative)

```bash
npm run build
npm publish
git push origin main --tags
```

## Check Publication Status

```bash
npm view react-native-calendar-resource
```

## Links

- **npm**: https://www.npmjs.com/package/react-native-calendar-resource
- **GitHub**: https://github.com/abdosobhy1/react-native-calendar-resource
- **Releases**: https://github.com/abdosobhy1/react-native-calendar-resource/releases
