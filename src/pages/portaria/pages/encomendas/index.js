import { View, Text, TouchableOpacity, StyleSheet} from "react-native";
import {Link} from "expo-router";
import GradientLayout from "../../../../../src/Utils/gradiente";
import { Icon } from "@rneui/themed";
import StylesHomeIcons from "../../../../GlobalStyles/StylesHomeIcons";


function Encomendas() {
  return (
    <GradientLayout style={StylesHomeIcons.container}>

      <View style={StylesHomeIcons.contentContainer}>
        <View style={StylesHomeIcons.buttonContainer}>
          <Link href="/src/pages/portaria/pages/encomendas/registro" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="pen-plus"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Registro</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/src/pages/portaria/pages/encomendas/pendentes" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Pendentes</Text>
            </TouchableOpacity>
          </Link>
               <Link href="/src/pages/portaria/pages/encomendas/EncomendasEntregues" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Entregues</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </GradientLayout>
  );
}


export default Encomendas;
