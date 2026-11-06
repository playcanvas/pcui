export * from './binding';
export * from './components/components';

// these strings are set by the build script, so widen them to string rather than keep their
// placeholder literal types
export const version = 'PACKAGE_VERSION' as string;
export const revision = 'PACKAGE_REVISION' as string;
