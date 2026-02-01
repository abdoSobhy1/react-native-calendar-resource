# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-01

### Added
- Drag and drop functionality for events
- Pinch-to-zoom with focal point support (experimental)
- Snap-back zoom animation
- Synchronized scrolling between grid and headers

### Changed
- Improved gesture handling to prevent zoom/scroll conflicts
- Better TypeScript type safety by removing generic types

### Fixed
- Reanimated warnings during render
- Event positioning offset issues
- Drag animation smoothness

## [1.0.0] - Initial Release

### Added
- Resource-based calendar component
- Customizable time slots
- Event rendering with custom styles
- Unavailable slot support
- Full TypeScript support
- Date navigation
- Interactive callbacks for slots, events, and resources
