import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import UtilityMethods from '../../utility/UtilityMethods';

export interface UserOverlappingAvatarsProps {
  uris: string[];
  size?: number;
  overlap?: number;
}

const DEFAULT_SIZE = 12;

/**
 * Two (or more) circular avatars overlapping horizontally — e.g. group chats.
 */
export function UserOverlappingAvatars({
  uris,
  size = DEFAULT_SIZE,
  overlap = 3.5,
}: UserOverlappingAvatarsProps) {
  const s = UtilityMethods.wp(size);
  const ov = UtilityMethods.wp(overlap);
  const display = uris.slice(0, 2);

  return (
    <View style={[styles.row, { width: s + s - ov }]}>
      {display.map((uri, index) => (
        <Image
          key={`${uri}-${index}`}
          source={{ uri }}
          style={[
            styles.img,
            {
              width: s,
              height: s,
              borderRadius: s / 2,
              marginLeft: index === 0 ? 0 : -ov,
              zIndex: display.length - index,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  img: {
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.inputBackground,
  },
});
