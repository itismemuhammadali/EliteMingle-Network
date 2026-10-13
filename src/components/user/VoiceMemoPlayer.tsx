import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import Video, { type OnProgressData, type OnLoadData } from 'react-native-video';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';
import FontSize from '../../utility/FontSize';

export interface VoiceMemoPlayerProps {
  audioUri: string;
  onDelete?: () => void;
  showDelete?: boolean;
}

function PlayGlyph({ size = 20, color = Colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8 5V19L19 12L8 5Z" fill={color} />
    </Svg>
  );
}

function PauseGlyph({ size = 20, color = Colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="5" width="4" height="14" rx="1" fill={color} />
      <Rect x="14" y="5" width="4" height="14" rx="1" fill={color} />
    </Svg>
  );
}

function TrashGlyph({ size = 18, color = Colors.adminErrorRed }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6H5H21M19 6V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V6M8 6V4C8 2.9 8.9 2 10 2H14C15.1 2 16 2.9 16 4V6M10 11V17M14 11V17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatSeconds(totalSec: number): string {
  if (isNaN(totalSec) || totalSec < 0) return '0:00';
  const mins = Math.floor(totalSec / 60);
  const secs = Math.floor(totalSec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

import {
  getCachedAudioUri,
  getAudioMetadata,
  setAudioMetadata,
} from '../../services/audioCacheService';

const WAVE_BARS = [12, 24, 18, 28, 36, 22, 16, 32, 28, 14, 20, 30, 24, 16, 26, 18];

function VoiceMemoPlayerComponent({
  audioUri,
  onDelete,
  showDelete = false,
}: VoiceMemoPlayerProps) {
  const resolvedUri = useMemo(() => getCachedAudioUri(audioUri), [audioUri]);
  const cachedMeta = useMemo(() => getAudioMetadata(resolvedUri), [resolvedUri]);

  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(cachedMeta?.duration || 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(!cachedMeta?.loaded);

  // Memoize audio source object so updating playback time or re-rendering never reloads the audio
  const videoSource = useMemo(() => ({ uri: resolvedUri }), [resolvedUri]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleLoad = useCallback((meta: OnLoadData) => {
    const d = meta.duration || 0;
    setDuration(d);
    setLoading(false);
    if (d > 0) {
      setAudioMetadata(resolvedUri, d);
    }
  }, [resolvedUri]);

  const handleProgress = useCallback((progress: OnProgressData) => {
    setCurrentTime(progress.currentTime || 0);
  }, []);

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (playerRef.current?.seek) {
      playerRef.current.seek(0);
    }
  }, []);

  return (
    <View style={styles.card}>
      <Video
        ref={playerRef}
        source={videoSource}
        paused={!isPlaying}
        onLoad={handleLoad}
        onProgress={handleProgress}
        onEnd={handleEnd}
        playInBackground={false}
        ignoreSilentSwitch="ignore"
        preventsDisplaySleepDuringVideoPlayback={false}
        style={styles.hiddenAudio}
      />

      <TouchableOpacity
        style={styles.playBtn}
        onPress={togglePlay}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause voice memo' : 'Play voice memo'}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : isPlaying ? (
          <PauseGlyph size={UtilityMethods.wp(5)} />
        ) : (
          <PlayGlyph size={UtilityMethods.wp(5)} />
        )}
      </TouchableOpacity>

      <View style={styles.middleColumn}>
        <View style={styles.waveformRow}>
          {WAVE_BARS.map((h, idx) => {
            const barFraction = idx / WAVE_BARS.length;
            const isFilled = duration > 0 && currentTime / duration >= barFraction;
            return (
              <View
                key={idx}
                style={[
                  styles.waveformBar,
                  { height: h },
                  isFilled ? styles.waveformBarActive : styles.waveformBarInactive,
                ]}
              />
            );
          })}
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatSeconds(currentTime)}</Text>
          <Text style={styles.timeText}>{formatSeconds(duration)}</Text>
        </View>
      </View>

      {showDelete && onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Delete voice memo"
        >
          <TrashGlyph size={UtilityMethods.wp(5)} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export const VoiceMemoPlayer = React.memo(
  VoiceMemoPlayerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.audioUri === nextProps.audioUri &&
      prevProps.showDelete === nextProps.showDelete &&
      prevProps.onDelete === nextProps.onDelete
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: UtilityMethods.wp(3.5),
    paddingHorizontal: UtilityMethods.wp(3.5),
    paddingVertical: UtilityMethods.hp(1.5),
    marginVertical: UtilityMethods.hp(1),
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  hiddenAudio: {
    width: 0,
    height: 0,
    position: 'absolute',
  },
  playBtn: {
    width: UtilityMethods.wp(11),
    height: UtilityMethods.wp(11),
    borderRadius: UtilityMethods.wp(5.5),
    backgroundColor: Colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: UtilityMethods.wp(3),
  },
  middleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    paddingHorizontal: UtilityMethods.wp(1),
  },
  waveformBar: {
    width: 3.5,
    borderRadius: 2,
  },
  waveformBarActive: {
    backgroundColor: Colors.primaryPurple,
  },
  waveformBarInactive: {
    backgroundColor: '#C4B5FD',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UtilityMethods.hp(0.4),
    paddingHorizontal: UtilityMethods.wp(1),
  },
  timeText: {
    fontSize: FontSize.VALUE(11),
    color: Colors.textGrey,
    fontWeight: '500',
  },
  deleteBtn: {
    marginLeft: UtilityMethods.wp(2.5),
    padding: UtilityMethods.wp(2),
  },
});
