import React from "react";
import { View, StatusBar, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Icon, Text } from "@rneui/themed";
import GradientLayout from '../../../../../Utils/gradiente';

function AgendaHome() {
  return (
    <GradientLayout style={styles.container}>

      <View style={styles.contentContainer}>
        <View style={styles.buttonContainer}>
          <Link href="/src/pages/moradores/pages/agenda/agendamento" asChild>
            <TouchableOpacity style={styles.button}>
              <Icon
                name="pen-plus"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={styles.buttonText}>Agendar</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/src/pages/moradores/pages/agenda/agendado" asChild>
            <TouchableOpacity style={styles.button}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={styles.buttonText}>Minha agenda</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    width: '40%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFF3EA',
    borderRadius: 12,
    padding: 15,
    margin: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#EFF3EA',
    textAlign: 'center',
  },
});

export default AgendaHome;