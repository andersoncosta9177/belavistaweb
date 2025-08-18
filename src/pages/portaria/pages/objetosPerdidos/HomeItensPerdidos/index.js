import React from "react";
import { View, Text, TouchableOpacity, StatusBar} from "react-native";
import {Link} from "expo-router";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import StylesHomeIcons from "../../../../../GlobalStyles/StylesHomeIcons"; 
import { Icon } from "@rneui/themed";

function ObjetosPerdidos() {
   return (
    <GradientLayout style={StylesHomeIcons.container}>

      <View style={StylesHomeIcons.contentContainer}>
        <View style={StylesHomeIcons.buttonContainer}>
          <Link href="/src/pages/portaria/pages/objetosPerdidos/cadastroItensPerdidos" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="pen-plus"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/src/pages/portaria/pages/objetosPerdidos/visualizacaoItensPerdidos" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Registrados</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </GradientLayout>
  );
}

export default ObjetosPerdidos;
