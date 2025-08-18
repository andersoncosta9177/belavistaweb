import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "@rneui/base";
import { Link } from "expo-router";
import GradientLayout from "../../../../../../src/Utils/gradiente";

function HomeVisitantes() {
  return (
    <GradientLayout style={styles.container}>
      <View style={styles.iconsContainer}>
        <Link href="/src/pages/moradores/pages/visitantes/autorizarVisitantes" asChild>
          <TouchableOpacity style={styles.iconButton}>
            <Icon
              name="pen-plus"
              type="material-community"
              size={50}
              color="#f5f5f5"
            />
            <Text style={styles.iconText}>Emitir</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/src/pages/moradores/pages/visitantes/visitantesAutorizados" asChild>
          <TouchableOpacity style={styles.iconButton}>
            <Icon
              name="pending-actions"
              type="material"
              size={50}
              color="#f5f5f5"
            />
            <Text style={styles.iconText}>Publicados</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 10,
    width: '30%'
  },
  iconText: {
    color: '#f5f5f5',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeVisitantes;