declare module 'react-native-sound' {
  class Sound {
    static MAIN_BUNDLE: string;
    static DOCUMENT: string;
    static LIBRARY: string;
    static CACHES: string;

    /** Set the audio session category (must be called before creating Sound instances). */
    static setCategory(
      category: 'Playback' | 'Ambient' | 'SoloAmbient' | 'Record' | 'PlayAndRecord' | 'AudioProcessing',
      mixWithOthers?: boolean
    ): void;

    /** @param filename  File name (no path) from the given basePath. */
    constructor(
      filename: string,
      basePath: string,
      onError?: (error: Error | null, sound: Sound) => void
    );

    /** Start playing; calls callback when playback ends or fails. */
    play(onEnd?: (success: boolean) => void): Sound;

    /** Pause playback. */
    pause(callback?: () => void): Sound;

    /** Stop playback and rewind. */
    stop(callback?: () => void): Sound;

    /** Release native resource — call when done with the sound. */
    release(): void;

    /** Set volume 0.0–1.0. */
    setVolume(value: number): Sound;

    /**
     * Set the number of times to loop.
     * -1 = infinite, 0 = no loop (play once), n = loop n times.
     */
    setNumberOfLoops(value: number): Sound;

    /** Returns whether the sound is currently playing. */
    isPlaying(): boolean;

    /** Returns the total duration in seconds, or -1 if not loaded. */
    getDuration(): number;
  }

  export default Sound;
}
