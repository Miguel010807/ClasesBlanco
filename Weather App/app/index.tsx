import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';

const getWeatherIcon = (wmoCode: number) => {
  if (wmoCode === 0) return '◯'; 
  if (wmoCode >= 1 && wmoCode <= 3) return '⦤⦥';
  if (wmoCode >= 51 && wmoCode <= 67) return '///';
  return '●';
};

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<any[]>([]);
  const [dayIndex, setDayIndex] = useState(1); // Índice 1 es "Hoy"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // URL con coordenadas de BUENOS AIRES y tus parámetros
        const url = `https://api.open-meteo.com/v1/forecast?latitude=-34.6118&longitude=-58.4173&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,relative_humidity_2m_mean,wind_speed_10m_mean,surface_pressure_mean&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&past_days=1&forecast_days=2&wind_speed_unit=ms&timezone=auto`;
        
        const response = await fetch(url);
        const data = await response.json();

        const formatted = data.daily.time.map((date: string, i: number) => {
          // i=0 es Ayer, i=1 es Hoy, i=2 es Mañana
          const isToday = i === 1;
          
          let label = date.split('-').slice(1).reverse().join('/'); // Formato DD/MM
          if (i === 0) label = "AYER";
          if (i === 1) label = "HOY";

          return {
            date: label,
            // Si es hoy usa 'current', si es otro día usa el promedio 'mean'
            temp: isToday ? Math.round(data.current.temperature_2m) : Math.round(data.daily.temperature_2m_mean[i]),
            max: Math.round(data.daily.temperature_2m_max[i]),
            min: Math.round(data.daily.temperature_2m_min[i]),
            humidity: isToday ? data.current.relative_humidity_2m : Math.round(data.daily.relative_humidity_2m_mean[i]),
            wind: isToday ? data.current.wind_speed_10m : data.daily.wind_speed_10m_mean[i],
            pressure: isToday ? data.current.surface_pressure : Math.round(data.daily.surface_pressure_mean[i]),
            condition: getWeatherIcon(data.daily.weather_code[i] || 0),
          };
        });

        setWeatherData(formatted);
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchWeather();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#000" /></View>;

  const current = weatherData[dayIndex];

  return (
    <SafeAreaView style={styles.container} testID="weather-screen">
      
      {/* Navegación Superior */}
      <View style={styles.topNav}>
        <TouchableOpacity 
          onPress={() => dayIndex > 0 && setDayIndex(dayIndex - 1)} 
          testID="prev-day-button"
          disabled={dayIndex === 0}
        >
          <Text style={[styles.smallDate, dayIndex === 0 && {opacity: 0}]}>
            {dayIndex > 0 ? weatherData[dayIndex-1].date : ''}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.activeContainer}>
          <Text style={styles.activeDate} testID="current-day-label">{current.date}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => dayIndex < weatherData.length - 1 && setDayIndex(dayIndex + 1)} 
          testID="next-day-button"
          disabled={dayIndex === weatherData.length - 1}
        >
          <Text style={[styles.smallDate, dayIndex === weatherData.length - 1 && {opacity: 0}]}>
            {dayIndex < weatherData.length - 1 ? weatherData[dayIndex+1].date : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        <Text style={styles.cityText} testID="city-name">BUENOS AIRES</Text>

        <View style={styles.iconContainer}>
          <Text style={styles.hugeIcon} testID="weather-icon">{current.condition}</Text>
        </View>

        <View style={styles.metricsColumn}>
          <Text style={styles.metricText} testID="metric-humidity">💧 {current.humidity}%</Text>
          <Text style={styles.metricText} testID="metric-pressure">⏲️ {current.pressure} hPa</Text>
          <Text style={styles.metricText} testID="metric-wind">⚑ {current.wind} m/s</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.tempRow}>
          <Text style={styles.secondaryTemp}>{current.min}°</Text>
          <Text style={styles.mainTemp} testID="current-temperature">{current.temp}°</Text>
          <Text style={styles.secondaryTemp}>{current.max}°</Text>
        </View>

        <View style={styles.timeline}>
          <View style={styles.line} />
          <Text style={styles.nowLabel}>{dayIndex === 1 ? 'AHORA' : 'PROM'}</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.minMaxLabels} testID="min-max-temperature">
          MÍN {current.min}°  |  MÁX {current.max}°
        </Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 40, 
    paddingTop: 40 
  },
  smallDate: { fontSize: 12, color: '#BBB', fontWeight: '600', width: 60, textAlign: 'center' },
  activeContainer: { borderBottomWidth: 2, borderColor: '#000', paddingBottom: 2 },
  activeDate: { fontSize: 14, color: '#000', fontWeight: '900' },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cityText: { fontSize: 30, fontWeight: '900', letterSpacing: 5, marginBottom: 20 },
  iconContainer: { height: 160, justifyContent: 'center' },
  hugeIcon: { fontSize: 140, fontWeight: '100' },
  metricsColumn: { alignSelf: 'flex-start', marginLeft: 60, marginTop: 10 },
  metricText: { fontSize: 16, fontWeight: '700', marginVertical: 4 },
  footer: { paddingBottom: 40, alignItems: 'center' },
  tempRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  mainTemp: { fontSize: 80, fontWeight: '900', marginHorizontal: 25 },
  secondaryTemp: { fontSize: 28, fontWeight: '300', color: '#EEE' },
  timeline: { flexDirection: 'row', alignItems: 'center', width: '70%', marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#F0F0F0' },
  nowLabel: { fontSize: 10, fontWeight: '900', marginHorizontal: 15, letterSpacing: 1 },
  minMaxLabels: { fontSize: 13, fontWeight: '800', color: '#AAA' }
});