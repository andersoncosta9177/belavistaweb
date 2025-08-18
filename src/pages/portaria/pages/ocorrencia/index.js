import { View, Text, TouchableOpacity} from "react-native";
import {Link} from "expo-router";
import GradientLayout from "../../../../../src/Utils/gradiente";
import StylesHomeIcons from "../../../../GlobalStyles/StylesHomeIcons"; 
import { Icon } from "@rneui/themed";

function HomeOcorrencias() {
    return (
    <GradientLayout style={StylesHomeIcons.container}>
      <View style={StylesHomeIcons.contentContainer}>
        <View style={StylesHomeIcons.buttonContainer}>
          <Link href="/src/pages/portaria/pages/ocorrencia/registroOcorrencia" asChild>
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

          <Link
            href="/src/pages/portaria/pages/ocorrencia/VisualizacaoOcorrencia"
            asChild
          >
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="calendar-clock"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Visualizar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </GradientLayout>
  );
}

export default HomeOcorrencias;
