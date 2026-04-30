
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import * as Location from 'expo-location';

/* ---------------- TYPES ---------------- */

type WeatherDay = {
  date: string;
  temp: number;
  max: number;
  min: number;
  humidity: number;
  wind: number;
  pressure: number;
  code: number;
};

type LocationCoords = {
  latitude: number;
  longitude: number;
};

/* ---------------- ICONOS ---------------- */

const SunIcon = () => (
  <Svg width={140} height={140} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="35" fill="none" stroke="black" strokeWidth="8" />
  </Svg>
);

const RainIcon = () => (
  <Svg width={180} height={140} viewBox="0 0 180 140">
    <Line x1="20" y1="85" x2="35" y2="55" stroke="black" strokeWidth="10" />
    <Line x1="45" y1="95" x2="65" y2="55" stroke="black" strokeWidth="10" />
    <Line x1="80" y1="115" x2="100" y2="35" stroke="black" strokeWidth="10" />
    <Line x1="115" y1="95" x2="135" y2="55" stroke="black" strokeWidth="10" />
    <Line x1="145" y1="110" x2="160" y2="80" stroke="black" strokeWidth="10" />
  </Svg>
);

const CloudIcon = () => (
  <Svg width={180} height={120} viewBox="0 0 180 120">
    <Path
      d="M55 90 H135 A25 25 0 0 0 135 40 A35 35 0 0 0 70 30 A28 28 0 0 0 55 90"
      fill="none"
      stroke="black"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const getWeatherIcon = (code: number) => {
  if (code === 0) return <SunIcon />;
  if (code >= 1 && code <= 3) return <CloudIcon />;
  if (code >= 51 && code <= 67) return <RainIcon />;
  return <CloudIcon />;
};

/* ---------------- APP ---------------- */

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);
  const [dayIndex, setDayIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [city, setCity] = useState<string>('CARGANDO...');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          alert('Se necesita permiso de ubicación');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude }: LocationCoords = location.coords;

        const reverse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverse.length > 0) {
          setCity(
            reverse[0].city?.toUpperCase() ||
              reverse[0].region?.toUpperCase() ||
              'UBICACIÓN'
          );
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_mean,surface_pressure_mean&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&past_days=1&forecast_days=2&wind_speed_unit=ms&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        const formatted: WeatherDay[] = data.daily.time.map(
          (date: string, i: number) => {
            const isToday = i === 1;

            return {
              date: date.split('-').slice(1).reverse().join('/'),
              temp: isToday
                ? Math.round(data.current.temperature_2m)
                : Math.round(data.daily.temperature_2m_mean[i]),
              max: Math.round(data.daily.temperature_2m_max[i]),
              min: Math.round(data.daily.temperature_2m_min[i]),
              humidity: isToday
                ? data.current.relative_humidity_2m
                : Math.round(data.daily.relative_humidity_2m_mean[i]),
              wind: isToday
                ? data.current.wind_speed_10m
                : data.daily.wind_speed_10m_mean[i],
              pressure: isToday
                ? data.current.surface_pressure
                : Math.round(data.daily.surface_pressure_mean[i]),
              code: data.daily.weather_code[i],
            };
          }
        );

        setWeatherData(formatted);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const current = weatherData[dayIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => dayIndex > 0 && setDayIndex(dayIndex - 1)}
          disabled={dayIndex === 0}
        >
          <Text style={[styles.smallDate, dayIndex === 0 && styles.hidden]}>
            {weatherData[dayIndex - 1]?.date || ''}
          </Text>
        </TouchableOpacity>

        <Text style={styles.activeDate}>{current.date}</Text>

        <TouchableOpacity
          onPress={() =>
            dayIndex < weatherData.length - 1 && setDayIndex(dayIndex + 1)
          }
          disabled={dayIndex === weatherData.length - 1}
        >
          <Text
            style={[
              styles.smallDate,
              dayIndex === weatherData.length - 1 && styles.hidden,
            ]}
          >
            {weatherData[dayIndex + 1]?.date || ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.cityText}>{city}</Text>

        <View style={styles.iconContainer}>
          {getWeatherIcon(current.code)}
        </View>

        <View style={styles.metrics}>
          <Text style={styles.metric}>💧 {current.humidity}%</Text>
          <Text style={styles.metric}>⏲ {current.pressure} hPa</Text>
          <Text style={styles.metric}>⚑ {current.wind} m/s</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tempRow}>
          <Text style={styles.sideTemp}>{current.min}°</Text>
          <Text style={styles.mainTemp}>{current.temp}°</Text>
          <Text style={styles.sideTemp}>{current.max}°</Text>
        </View>

        <Text style={styles.now}>NOW</Text>
      </View>
    </SafeAreaView>
  );
}
/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },

  smallDate: {
    color: '#ccc',
    fontSize: 12,
  },

  activeDate: {
    fontSize: 14,
    fontWeight: '900',
    borderBottomWidth: 2,
    borderColor: '#000',
    paddingBottom: 2,
  },

  hidden: {
    opacity: 0,
  },

  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  cityText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },

  iconContainer: {
    width: 220,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },

  metrics: {
    alignItems: 'center',
  },

  metric: {
    fontWeight: '700',
    marginVertical: 4,
    fontSize: 14,
  },

  footer: {
    alignItems: 'center',
  },

  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mainTemp: {
    fontSize: 90,
    fontWeight: '900',
    marginHorizontal: 20,
  },

  sideTemp: {
    fontSize: 25,
    color: '#ccc',
  },

  now: {
    marginTop: 10,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
  },
});