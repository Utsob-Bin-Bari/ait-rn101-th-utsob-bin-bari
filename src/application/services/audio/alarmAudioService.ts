import Sound from 'react-native-sound';
import { Platform } from 'react-native';

let _sound: Sound | null = null;
let _isPlaying = false;

const ALARM_FILE = 'alarm.mp3';

const alarmAudioService = {
  /**
   * Starts the looping alarm sound. Safe to call multiple times — will not
   * double-play if already playing.
   */
  start(): void {
    if (_isPlaying) {
      return;
    }

    // Must be called here — after native modules are initialised — not at
    // module load time. 'Playback' lets audio play over the silent switch on iOS.
    Sound.setCategory('Playback');
    if (Platform.OS === 'ios') {
      (Sound as any).setActive(true);
    }

    _sound = new Sound(ALARM_FILE, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.warn('[alarmAudioService] Failed to load alarm sound:', error);
        _sound = null;
        return;
      }

      if (!_sound) {
        return;
      }

      _sound.setNumberOfLoops(-1); // -1 = infinite loop
      _sound.setVolume(1.0);
      _sound.play((success) => {
        if (!success) {
          console.warn('[alarmAudioService] Playback failed or was interrupted');
        }
        _isPlaying = false;
      });

      _isPlaying = true;
    });
  },

  /**
   * Stops the alarm sound and releases the native resource. Safe to call even
   * if no sound is playing.
   */
  stop(): void {
    if (_sound) {
      _sound.stop(() => {
        _sound?.release();
        _sound = null;
      });
    }
    _isPlaying = false;
    if (Platform.OS === 'ios') {
      (Sound as any).setActive(false);
    }
  },

  /** Returns true if the alarm is currently playing. */
  isPlaying(): boolean {
    return _isPlaying;
  },
};

export { alarmAudioService };
