/**
 * Globals available in React Native and modern Node (Jest) but absent from the
 * `@react-native/typescript-config` lib list (which intentionally excludes `dom`).
 */

declare function atob(data: string): string;
declare function btoa(data: string): string;
