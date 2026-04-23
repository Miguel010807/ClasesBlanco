import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import Svg, { Circle, Path, G, Line } from 'react-native-svg';

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

/* ---------------- ICONOS ---------------- */

const SunIcon = () => (
  <Svg width={140} height={140} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="32" stroke="#000" strokeWidth="12" fill="none" />
  </Svg>
);

const RainIcon = () => (
  <Svg width={140} height={140} viewBox="0 0 100 100">
    <G stroke="#000" strokeWidth="12" strokeLinecap="butt">
      {/* Líneas diagonales replicando el patrón escalonado */}
      <Line x1="18" y1="65" x2="33" y2="35" />
      <Line x1="33" y1="85" x2="63" y2="25" />
      <Line x1="58" y1="65" x2="78" y2="25" />
      <Line x1="78" y1="75" x2="88" y2="55" />
    </G>
  </Svg>
);

const CloudIcon = () => (
  <Svg width={140} height={140} viewBox="0 0 100 100">
    {/* Arco superior */}
    <Path
      d="M 15 50 A 25 25 0 0 1 65 50"
      stroke="#000"
      strokeWidth="12"
      fill="none"
      strokeLinecap="butt"
    />
    {/* Arco inferior (desplazado hacia la derecha y hacia abajo visualmente por el arco) */}
    <Path
      d="M 35 50 A 25 25 0 0 0 85 50"
      stroke="#000"
      strokeWidth="12"
      fill="none"
      strokeLinecap="butt"
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

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=-34.6118&longitude=-58.4173&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_mean,surface_pressure_mean&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&past_days=1&forecast_days=2&wind_speed_unit=ms&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        const formatted: WeatherDay[] = data.daily.time.map((date: string, i: number) => {
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
        });

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
        <ActivityIndicator />
      </View>
    );
  }

  const current = weatherData[dayIndex];

  return (
    <SafeAreaView style={styles.container}>

      {/* NAV */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => dayIndex > 0 && setDayIndex(dayIndex - 1)}
          disabled={dayIndex === 0}
        >
          <Text style={[styles.smallDate, dayIndex === 0 && { opacity: 0 }]}>
            {weatherData[dayIndex - 1]?.date || ''}
          </Text>
        </TouchableOpacity>

        <Text style={styles.activeDate}>{current.date}</Text>

        <TouchableOpacity
          onPress={() => dayIndex < weatherData.length - 1 && setDayIndex(dayIndex + 1)}
          disabled={dayIndex === weatherData.length - 1}
        >
          <Text style={[styles.smallDate, dayIndex === weatherData.length - 1 && { opacity: 0 }]}>
            {weatherData[dayIndex + 1]?.date || ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MAIN */}
      <View style={styles.mainContent}>
        <Text style={styles.cityText}>BUENOS AIRES</Text>

        <View style={styles.iconContainer}>
          {getWeatherIcon(current.code)}
        </View>

        <View style={styles.metrics}>
          <Text style={styles.metric}>💧 {current.humidity}%</Text>
          <Text style={styles.metric}>⏲ {current.pressure} hPa</Text>
          <Text style={styles.metric}>⚑ {current.wind} m/s</Text>
        </View>
      </View>

      {/* FOOTER */}
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
    fontWeight: '900',
    borderBottomWidth: 2,
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
    marginVertical: 20,
  },

  metrics: {
    alignItems: 'center',
  },

  metric: {
    fontWeight: '700',
    marginVertical: 3,
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
  },
});