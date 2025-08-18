import { View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Icon, Text } from "@rneui/themed";
import GradientLayout from '../../../../../../src/Utils/gradiente';
import StylesHomeIcons from "../../../../../GlobalStyles/StylesHomeIcons";

function AgendaHome() {
  return (
    <GradientLayout style={StylesHomeIcons.container}>

      <View style={StylesHomeIcons.contentContainer}>
        <View style={StylesHomeIcons.buttonContainer}>
          <Link href="/src/pages/portaria/pages/agenda/agendamento" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="pen-plus"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Agendar</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/src/pages/portaria/pages/agenda/agendado" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Agendados</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </GradientLayout>
  );
}

export default AgendaHome;