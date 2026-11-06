import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import firestore from '@react-native-firebase/firestore';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates great-circle distance between two GPS points using the Haversine formula (km).
 * Completely local — NO Google Maps API key or external service needed.
 */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates distance in miles.
 */
export function getDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  return getDistanceKm(lat1, lon1, lat2, lon2) * 0.621371;
}

/**
 * Request runtime location permission on Android and iOS.
 */
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'EPM uses your location to discover and connect with members within 50 km of you.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission request error:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    } catch (err) {
      console.warn('iOS location auth error:', err);
      return false;
    }
  }
  return true;
}

/**
 * Retrieves the current device coordinates via GPS sensors.
 */
export function getCurrentUserCoordinates(): Promise<Coordinates | null> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      position => {
        if (position && position.coords) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } else {
          resolve(null);
        }
      },
      error => {
        console.warn('Geolocation error:', error?.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

/**
 * Requests permission, retrieves GPS coordinates, and saves them to the user's Firestore document.
 */
export async function syncUserLocation(
  userId: string,
): Promise<Coordinates | null> {
  if (!userId) return null;
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  const coords = await getCurrentUserCoordinates();
  if (coords) {
    try {
      await firestore().collection('users').doc(userId).update({
        coordinates: coords,
        lastLocationUpdate: firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.warn('Failed to update coordinates in Firestore:', err);
    }
  }
  return coords;
}

