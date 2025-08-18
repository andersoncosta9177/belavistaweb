import { View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Icon, Text } from "@rneui/themed";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import StylesHomeIcons from "../../../../../GlobalStyles/StylesHomeIcons";

function DocumentosHome() {
  return (
    <GradientLayout style={StylesHomeIcons.container}>
      <View style={StylesHomeIcons.contentContainer}>
        <View style={StylesHomeIcons.buttonContainer}>
          <Link href="/src/pages/portaria/pages/documentos/registroDoc" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="file-alert-outline"
                type="material-community"
                size={40}
                color="#EFF3EA"
              />
              <Text style={StylesHomeIcons.buttonText}>Registrar</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/src/pages/portaria/pages/documentos/documentosRegistrados" asChild>
            <TouchableOpacity style={StylesHomeIcons.button}>
              <Icon
                name="file-check"
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

export default DocumentosHome;
