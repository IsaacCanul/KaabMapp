import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/colors";

export default function FormInput({ label, icon, value, onChangeText, placeholder, secureTextEntry, onToggleSecure, keyboardType = "default", multiline = false, required = false }) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {label}{required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View style={[styles.inputWrap, multiline && styles.multilineWrap]}>
        {icon ? <Ionicons name={icon} size={20} color={COLORS.gray} style={styles.icon} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray2}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
          style={[styles.input, multiline && styles.multiline]}
          multiline={multiline}
        />
        {onToggleSecure ? (
          <TouchableOpacity onPress={onToggleSecure} style={styles.eye}>
            <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={21} color={COLORS.gray} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: "700", marginBottom: 7 },
  required: { color: COLORS.error },
  inputWrap: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  multilineWrap: { alignItems: "flex-start", minHeight: 110, paddingTop: 12 },
  icon: { marginRight: 9, marginTop: 1 },
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 10 },
  multiline: { minHeight: 88, textAlignVertical: "top" },
  eye: { padding: 5 },
});
