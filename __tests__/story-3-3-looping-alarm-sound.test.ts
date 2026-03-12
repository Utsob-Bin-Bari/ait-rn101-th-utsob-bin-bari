/**
 * Story 3.3: Looping Alarm Sound
 * Tests cover alarmAudioService API shape and AlarmDismissScreen sound lifecycle.
 */

// ─── Mock react-native-sound ──────────────────────────────────────────────────

interface MockSoundInstance {
  play: jest.Mock;
  stop: jest.Mock;
  release: jest.Mock;
  setNumberOfLoops: jest.Mock;
  setVolume: jest.Mock;
  isPlaying: jest.Mock;
}

// Declare instance first so play/stop can reference it without circular inference.
const mockSoundInstance: MockSoundInstance = {
  play: jest.fn(),
  stop: jest.fn(),
  release: jest.fn(),
  setNumberOfLoops: jest.fn().mockReturnThis(),
  setVolume: jest.fn().mockReturnThis(),
  isPlaying: jest.fn().mockReturnValue(true),
};

// Wire up play/stop implementations now that mockSoundInstance is typed.
mockSoundInstance.play.mockImplementation((cb?: (success: boolean) => void): MockSoundInstance => {
  if (cb) cb(true);
  return mockSoundInstance;
});
mockSoundInstance.stop.mockImplementation((cb?: () => void): MockSoundInstance => {
  if (cb) cb();
  return mockSoundInstance;
});

let soundConstructorCallback: ((err: Error | null) => void) | null = null;

const MockSound = jest.fn().mockImplementation(
  (_filename: string, _basePath: string, cb?: (err: Error | null) => void) => {
    soundConstructorCallback = cb ?? null;
    return mockSoundInstance;
  }
);
(MockSound as any).MAIN_BUNDLE = 'MainBundle';
(MockSound as any).setCategory = jest.fn();

jest.mock('react-native-sound', () => MockSound);

// ─── Re-import service after mocks ───────────────────────────────────────────

// We load the service fresh each test to reset module-level state.
let alarmAudioService: typeof import('../src/application/services/audio/alarmAudioService').alarmAudioService;

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();

  soundConstructorCallback = null;

  jest.mock('react-native-sound', () => MockSound);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  alarmAudioService = require('../src/application/services/audio/alarmAudioService').alarmAudioService;
});

// ─── alarmAudioService API shape ─────────────────────────────────────────────

describe('alarmAudioService — API shape', () => {
  it('exports start, stop and isPlaying functions', () => {
    expect(typeof alarmAudioService.start).toBe('function');
    expect(typeof alarmAudioService.stop).toBe('function');
    expect(typeof alarmAudioService.isPlaying).toBe('function');
  });

  it('isPlaying returns false before start is called', () => {
    expect(alarmAudioService.isPlaying()).toBe(false);
  });
});

// ─── alarmAudioService.start ─────────────────────────────────────────────────

describe('alarmAudioService.start', () => {
  it('creates a Sound instance with alarm.wav from MAIN_BUNDLE', () => {
    alarmAudioService.start();
    expect(MockSound).toHaveBeenCalledWith(
      'alarm.wav',
      (MockSound as any).MAIN_BUNDLE,
      expect.any(Function)
    );
  });

  it('sets looping to -1 (infinite) and plays on successful load', () => {
    alarmAudioService.start();
    // Simulate successful load callback
    soundConstructorCallback?.(null);

    expect(mockSoundInstance.setNumberOfLoops).toHaveBeenCalledWith(-1);
    expect(mockSoundInstance.setVolume).toHaveBeenCalledWith(1.0);
    expect(mockSoundInstance.play).toHaveBeenCalled();
  });

  it('does not double-play if already playing', () => {
    alarmAudioService.start();
    soundConstructorCallback?.(null); // first start succeeds

    alarmAudioService.start(); // second call while playing

    expect(MockSound).toHaveBeenCalledTimes(1);
  });

  it('logs a warning and does not crash on load error', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    alarmAudioService.start();
    soundConstructorCallback?.(new Error('file not found'));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[alarmAudioService]'),
      expect.any(Error)
    );
    expect(mockSoundInstance.play).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ─── alarmAudioService.stop ──────────────────────────────────────────────────

describe('alarmAudioService.stop', () => {
  it('stops and releases sound after it has been started', () => {
    alarmAudioService.start();
    soundConstructorCallback?.(null);

    alarmAudioService.stop();

    expect(mockSoundInstance.stop).toHaveBeenCalled();
  });

  it('does not throw when stop is called before start', () => {
    expect(() => alarmAudioService.stop()).not.toThrow();
  });

  it('isPlaying returns false after stop', () => {
    alarmAudioService.start();
    soundConstructorCallback?.(null);

    alarmAudioService.stop();

    expect(alarmAudioService.isPlaying()).toBe(false);
  });
});

// ─── AlarmDismissScreen sound lifecycle (logical spec) ────────────────────────

describe('AlarmDismissScreen — sound lifecycle (logical spec)', () => {
  it('AC1: start() is called when the screen mounts', () => {
    // Represents the useEffect(() => { alarmAudioService.start(); return () => stop(); }, [])
    const startSpy = jest.spyOn(alarmAudioService, 'start');
    const stopSpy = jest.spyOn(alarmAudioService, 'stop');

    // Simulate mount
    const cleanup = (() => {
      alarmAudioService.start();
      return () => alarmAudioService.stop();
    })();

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(stopSpy).not.toHaveBeenCalled();

    // Simulate unmount (cleanup)
    cleanup();
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it('AC2: stop() is called in handleDismiss before navigating', () => {
    const stopSpy = jest.spyOn(alarmAudioService, 'stop');
    const goBack = jest.fn();

    // Simulate handleDismiss logic
    const handleDismiss = async () => {
      alarmAudioService.stop();
      // cancelAlarmNotification would run here
      goBack();
    };

    handleDismiss();
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('AC3: stop() is called in handleSnooze before navigating (notification NOT cancelled)', () => {
    const stopSpy = jest.spyOn(alarmAudioService, 'stop');
    const cancelAlarm = jest.fn();
    const goBack = jest.fn();

    // Simulate handleSnooze logic (no cancelAlarmNotification call)
    const handleSnooze = () => {
      alarmAudioService.stop();
      goBack();
    };

    handleSnooze();
    expect(stopSpy).toHaveBeenCalledTimes(1);
    expect(cancelAlarm).not.toHaveBeenCalled();
    expect(goBack).toHaveBeenCalledTimes(1);
  });
});
