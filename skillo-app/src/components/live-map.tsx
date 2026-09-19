import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { WebView } from "react-native-webview";

interface HelperMarker {
  name: string;
  lat: number;
  lng: number;
  skill: string;
  distanceKm?: number;
}

interface LiveMapProps {
  seekerLat: number;
  seekerLng: number;
  radiusKm: number;
  helpers?: HelperMarker[];
  targetHelper?: HelperMarker | null;
  height?: number;
}

export function LiveMap({
  seekerLat,
  seekerLng,
  radiusKm,
  helpers = [],
  targetHelper = null,
  height = 240,
}: LiveMapProps) {
  const radiusMeters = radiusKm * 1000;

  // Build Leaflet markers for helpers
  const markersJs = helpers
    .map(
      (h) => `
      L.marker([${h.lat}, ${h.lng}], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: '<div style="background:#238636;color:#fff;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.5);border:2px solid #fff;">📍 ${h.name.split(" ")[0]} (${h.distanceKm || 0.3}km)</div>',
          iconSize: [60, 24],
          iconAnchor: [30, 24]
        })
      }).addTo(map).bindPopup('<b>${h.name}</b><br/>Skill: ${h.skill}<br/>Distance: ${h.distanceKm || 0.3} km');
    `
    )
    .join("\n");

  const targetHelperMarkerJs = targetHelper
    ? `
      L.marker([${targetHelper.lat}, ${targetHelper.lng}], {
        icon: L.divIcon({
          className: 'custom-pin',
          html: '<div style="background:#238636;color:#fff;padding:6px 10px;border-radius:14px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.6);border:2px solid #fff;">⭐ ${targetHelper.name}</div>',
          iconSize: [80, 28],
          iconAnchor: [40, 28]
        })
      }).addTo(map);

      // Connecting line between Seeker and Helper
      L.polyline([[${seekerLat}, ${seekerLng}], [${targetHelper.lat}, ${targetHelper.lng}]], {
        color: '#2ea043',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.9
      }).addTo(map);
    `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html { margin: 0; padding: 0; height: 100%; width: 100%; background: #0d1117; }
          #map { height: 100%; width: 100%; }
          .leaflet-tile { filter: brightness(0.85) contrast(1.1); }
          .seeker-pin {
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.9; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.9; }
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${seekerLat}, ${seekerLng}], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          // Seeker Center Pin
          L.marker([${seekerLat}, ${seekerLng}], {
            icon: L.divIcon({
              className: 'seeker-pin',
              html: '<div style="background:#e63946;color:#fff;padding:5px 8px;border-radius:12px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 0 10px #e63946;border:2px solid #fff;">🚨 You (In Distress)</div>',
              iconSize: [60, 24],
              iconAnchor: [30, 24]
            })
          }).addTo(map);

          // Expanding Radius Circle (2km -> 4km -> 6km)
          var circle = L.circle([${seekerLat}, ${seekerLng}], {
            color: '#58a6ff',
            fillColor: '#58a6ff',
            fillOpacity: 0.12,
            weight: 2,
            radius: ${radiusMeters}
          }).addTo(map);

          ${markersJs}
          ${targetHelperMarkerJs}

          // Auto-fit bounds
          var group = new L.featureGroup([circle]);
          map.fitBounds(group.getBounds(), { padding: [20, 20] });
        </script>
      </body>
    </html>
  `;

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          srcDoc={htmlContent}
          style={{ width: "100%", height: "100%", border: "none", borderRadius: 14 }}
          title="OpenStreetMap"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#30363d",
    marginBottom: 16,
    backgroundColor: "#0d1117",
  },
  webView: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
});
