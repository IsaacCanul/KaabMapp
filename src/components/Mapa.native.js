import React from "react";
import {
  StyleSheet,
  View,
} from "react-native";

import MapView, {
  Marker,
  UrlTile,
} from "react-native-maps";

const REGION_YUCATAN = {
  latitude: 20.7099,
  longitude: -89.0943,
  latitudeDelta: 3,
  longitudeDelta: 3,
};

export default function Mapa({
  meliponarios = [],
  onSelectMeliponario,
}) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={REGION_YUCATAN}
        mapType="none"
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {meliponarios.map((item) => {
          const latitude =
            Number(
              item.latitude ??
              item.latitud
            );

          const longitude =
            Number(
              item.longitude ??
              item.longitud
            );

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            return null;
          }

          return (
            <Marker
              key={String(
                item.id ??
                `${latitude}-${longitude}`
              )}
              coordinate={{
                latitude,
                longitude,
              }}
              title={
                item.nombre ??
                "Meliponario"
              }
              description={
                item.municipio ??
                item.localidad ??
                ""
              }
              onPress={() =>
                onSelectMeliponario?.(
                  item
                )
              }
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    map: {
      flex: 1,
    },
  });