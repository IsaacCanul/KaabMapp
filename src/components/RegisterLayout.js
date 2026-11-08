
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AppLogo from "./AppLogo";
import { styles } from "./RegisterLayout.styles";

const STEPS = [
  {
    number: 1,
    route: "RegisterStep1",
    label: "Información general",
  },
  {
    number: 2,
    route: "RegisterStep2",
    label: "Ubicación",
  },
  {
    number: 3,
    route: "RegisterStep3",
    label: "Especies y colmenas",
  },
  {
    number: 4,
    route: "RegisterStep5",
    label: "Confirmación",
  },
];

export default function RegisterLayout({
  navigation,
  step = 1,
  title = "Registrar meliponario",
  subtitle = "",
  children,
}) {
  const currentStep = Math.min(
    4,
    Math.max(1, Number(step) || 1)
  );

  const handleStepPress = (targetStep) => {
    if (targetStep >= currentStep) {
      return;
    }

    const target = STEPS.find(
      (item) => item.number === targetStep
    );

    if (target) {
      navigation.navigate(target.route);
    }
  };

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityLabel="Volver"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color="#075A3D"
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <AppLogo compact />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.stepsRow}>
            {STEPS.map((item, index) => {
              const isCurrent =
                item.number === currentStep;

              const isCompleted =
                item.number < currentStep;

              const isFuture =
                item.number > currentStep;

              return (
                <React.Fragment key={item.route}>
                  <TouchableOpacity
                    disabled={!isCompleted}
                    onPress={() =>
                      handleStepPress(item.number)
                    }
                    activeOpacity={
                      isCompleted ? 0.7 : 1
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      `Ir al paso ${item.number}: ${item.label}`
                    }
                    accessibilityState={{
                      disabled: !isCompleted,
                      selected: isCurrent,
                    }}
                    style={[
                      styles.stepCircle,
                      isCompleted &&
                        styles.stepCompleted,
                      isCurrent &&
                        styles.stepCurrent,
                      isFuture &&
                        styles.stepFuture,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#FFFFFF"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          isCurrent &&
                            styles.stepNumberCurrent,
                          isFuture &&
                            styles.stepNumberFuture,
                        ]}
                      >
                        {item.number}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {index < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        isCompleted &&
                          styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.stepInformation}>
            <Text style={styles.stepLabel}>
              Paso {currentStep} de 4
            </Text>

            <Text style={styles.stepHint}>
              Puedes tocar un paso anterior
              para volver rápidamente.
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>
            {title}
          </Text>

          {Boolean(subtitle) && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}

          <View style={styles.children}>
            {children}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
