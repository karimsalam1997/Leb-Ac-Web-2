"use client";

import { useEffect } from "react";
import {
  Circle,
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature, GeoJsonObject, Geometry } from "geojson";
import type {
  BattlefieldFeatureProperties,
  BattlefieldGeoJson,
  BoundaryGeoJson,
  DistrictGeoJson,
  SignalCluster,
} from "@/lib/signal-desk";
import styles from "./signal-desk.module.css";

function eventColor(cluster: SignalCluster) {
  if (cluster.signal_tags.includes("casualty")) return "#7f1515";
  if (cluster.signal_tags.includes("strike-claim")) return "#b73727";
  if (cluster.signal_tags.includes("displacement")) return "#bd6f27";
  if (cluster.signal_tags.includes("humanitarian")) return "#315f7b";
  if (cluster.signal_tags.includes("economic")) return "#386a56";
  return "#4d4968";
}

function layerStyle(feature?: Feature<Geometry, BattlefieldFeatureProperties>): PathOptions {
  const kind = feature?.properties?.kind;
  if (kind === "yellow-line") {
    return {
      color: "#f3cb34",
      opacity: 1,
      weight: 4,
      dashArray: "1 0",
    };
  }
  return {
    color: "#a52e25",
    fillColor: "#c33a2f",
    fillOpacity: 0.23,
    opacity: 0.88,
    weight: 1.5,
  };
}

function bindBattlefieldDescription(
  feature: Feature<Geometry, BattlefieldFeatureProperties>,
  layer: Layer,
) {
  const properties = feature.properties;
  if (!properties) return;
  layer.bindTooltip(properties.short_label, {
    sticky: true,
    direction: "top",
    className: styles.mapTooltip,
  });
  const popup = document.createElement("div");
  popup.className = styles.layerPopup;
  const title = document.createElement("strong");
  title.textContent = properties.label;
  const description = document.createElement("p");
  description.textContent = properties.description;
  const record = document.createElement("span");
  record.textContent = `As of ${properties.as_of} · ${properties.precision}`;
  const source = document.createElement("a");
  source.href = properties.source_url;
  source.target = "_blank";
  source.rel = "noreferrer";
  source.textContent = properties.source_label;
  popup.append(title, description, record, source);
  layer.bindPopup(popup, { maxWidth: 320 });
}

function MapFocus({ cluster }: { cluster: SignalCluster | null }) {
  const map = useMap();
  const location = cluster?.primary_location;

  useEffect(() => {
    if (!location) return;
    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 9), {
      duration: 0.55,
    });
  }, [location, map]);

  return null;
}

export function SignalDeskMap({
  clusters,
  districts,
  boundary,
  battlefield,
  selectedId,
  showTerritory,
  onSelect,
}: {
  clusters: SignalCluster[];
  districts: DistrictGeoJson;
  boundary: BoundaryGeoJson;
  battlefield: BattlefieldGeoJson;
  selectedId: string | null;
  showTerritory: boolean;
  onSelect: (id: string) => void;
}) {
  const selectedCluster = clusters.find((cluster) => cluster.id === selectedId) ?? null;

  return (
    <MapContainer
      center={[33.68, 35.58]}
      zoom={8}
      minZoom={7}
      maxZoom={14}
      maxBounds={[
        [32.82, 34.72],
        [34.78, 36.76],
      ]}
      maxBoundsViscosity={0.86}
      scrollWheelZoom={false}
      className={styles.map}
      attributionControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        opacity={0.96}
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      />

      {districts.features.length ? (
        <GeoJSON
          data={districts as GeoJsonObject}
          style={{
            color: "rgba(35, 48, 42, 0.26)",
            fillColor: "#8f8a78",
            fillOpacity: 0.025,
            weight: 0.8,
          }}
        />
      ) : null}

      {showTerritory && battlefield.features.length ? (
        <GeoJSON
          key="battlefield-layers"
          data={battlefield as GeoJsonObject}
          style={(feature) =>
            layerStyle(feature as Feature<Geometry, BattlefieldFeatureProperties> | undefined)
          }
          onEachFeature={(feature, layer) =>
            bindBattlefieldDescription(
              feature as Feature<Geometry, BattlefieldFeatureProperties>,
              layer,
            )
          }
        />
      ) : null}

      {boundary.features.length ? (
        <GeoJSON
          data={boundary as GeoJsonObject}
          style={{
            color: "#18241f",
            fillOpacity: 0,
            opacity: 0.95,
            weight: 2.4,
          }}
        />
      ) : null}

      {clusters.map((cluster) => {
        const location = cluster.primary_location;
        if (!location || cluster.location_precision === "unknown") return null;
        const selected = cluster.id === selectedId;
        const color = eventColor(cluster);
        const broadArea =
          cluster.map_marker_kind === "representative-area" ||
          cluster.location_precision === "district" ||
          cluster.location_precision === "national";

        if (broadArea) {
          return (
            <Circle
              key={cluster.id}
              center={[location.lat, location.lng]}
              radius={
                cluster.map_radius_meters ||
                (cluster.location_precision === "national" ? 28000 : 12000)
              }
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: selected ? 0.17 : 0.08,
                opacity: selected ? 1 : 0.76,
                weight: selected ? 3 : 2,
                dashArray: "5 5",
              }}
              eventHandlers={{ click: () => onSelect(cluster.id) }}
            >
              <Tooltip direction="top" opacity={0.98} className={styles.mapTooltip}>
                {location.name} · area report
              </Tooltip>
              <Popup maxWidth={320}>
                <div className={styles.eventPopup}>
                  <span>{cluster.sources_span[0] ?? "Source-linked report"}</span>
                  <strong>{cluster.headline}</strong>
                  <p>{cluster.what_happened || cluster.analysis}</p>
                  {cluster.urls[0] ? (
                    <a href={cluster.urls[0]} target="_blank" rel="noreferrer">
                      Open original report
                    </a>
                  ) : null}
                </div>
              </Popup>
            </Circle>
          );
        }

        return (
          <CircleMarker
            key={cluster.id}
            center={[location.lat, location.lng]}
            radius={selected ? 10 : 7}
            pathOptions={{
              color: "#fffaf0",
              fillColor: color,
              fillOpacity: 0.98,
              opacity: 1,
              weight: selected ? 3.5 : 2,
            }}
            eventHandlers={{ click: () => onSelect(cluster.id) }}
          >
            <Tooltip direction="top" opacity={0.98} className={styles.mapTooltip}>
              {location.name} · {cluster.sources_span[0] ?? "source linked"}
            </Tooltip>
            <Popup maxWidth={320}>
              <div className={styles.eventPopup}>
                <span>{cluster.sources_span[0] ?? "Source-linked report"}</span>
                <strong>{cluster.headline}</strong>
                <p>{cluster.what_happened || cluster.analysis}</p>
                {cluster.urls[0] ? (
                  <a href={cluster.urls[0]} target="_blank" rel="noreferrer">
                    Open original report
                  </a>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      <MapFocus cluster={selectedCluster} />
    </MapContainer>
  );
}
