import React, { useEffect, useRef, useState } from "react";

import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

/*
 * Visor de fotografías a pantalla completa.
 * Se desliza entre fotos y se cierra con la X o el botón «atrás».
 *
 * props:
 *   visible     boolean
 *   photos      arreglo de URLs
 *   initialIndex foto con la que abre
 *   captions    descripción opcional de cada foto (misma posición)
 *   onClose     al cerrar; recibe el índice de la foto que se veía
 */
export default function PhotoViewer({
  visible,
  photos = [],
  initialIndex = 0,
  captions = [],
  onClose,
}) {
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);

  // Al abrir, colocarse en la foto elegida.
  useEffect(() => {
    if (!visible) return;

    setIndex(initialIndex);

    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false });
    }, 0);

    return () => clearTimeout(t);
  }, [visible, initialIndex, width]);

  const onScroll = (event) => {
    const x = Number(event?.nativeEvent?.contentOffset?.x ?? 0);
    if (!width || !Number.isFinite(x)) return;
    setIndex(Math.max(0, Math.min(photos.length - 1, Math.round(x / width))));
  };

  const cerrar = () => onClose?.(index);

  const ir = (n) => {
    if (n < 0 || n >= photos.length) return;
    setIndex(n);
    scrollRef.current?.scrollTo({ x: n * width, animated: true });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={cerrar}
      supportedOrientations={["portrait", "landscape"]}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onMomentumScrollEnd={onScroll}
        >
          {photos.map((uri, i) => (
            <View
              key={`${i}-${uri}`}
              style={{ width, height, justifyContent: "center" }}
            >
              <Image
                source={{ uri }}
                style={{ width, height: height * 0.8 }}
                resizeMode="contain"
                accessibilityLabel={`Fotografía ${i + 1} de ${photos.length}`}
              />
            </View>
          ))}
        </ScrollView>

        <SafeAreaView style={styles.topBar} edges={["top"]} pointerEvents="box-none">
          <Text style={styles.counter}>
            {photos.length ? `${index + 1} / ${photos.length}` : ""}
          </Text>

          <TouchableOpacity
            style={styles.close}
            onPress={cerrar}
            accessibilityRole="button"
            accessibilityLabel="Cerrar fotografía"
            hitSlop={10}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </SafeAreaView>

        {!!captions[index] && (
          <SafeAreaView style={styles.captionBar} edges={["bottom"]} pointerEvents="none">
            <Text style={styles.caption}>{captions[index]}</Text>
          </SafeAreaView>
        )}

        {/* Flechas para web y para quien prefiera tocar en lugar de deslizar. */}
        {photos.length > 1 && index > 0 && (
          <TouchableOpacity
            style={[styles.arrow, { left: 12, top: height / 2 - 24 }]}
            onPress={() => ir(index - 1)}
            accessibilityLabel="Foto anterior"
          >
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {photos.length > 1 && index < photos.length - 1 && (
          <TouchableOpacity
            style={[styles.arrow, { right: 12, top: height / 2 - 24 }]}
            onPress={() => ir(index + 1)}
            accessibilityLabel="Foto siguiente"
          >
            <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000000" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  counter: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 8 },
  captionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  caption: { color: "#FFFFFF", fontSize: 15, lineHeight: 21, textAlign: "center" },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
