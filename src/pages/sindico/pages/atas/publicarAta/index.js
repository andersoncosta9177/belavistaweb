import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Input, Icon, Card } from "@rneui/themed";
import { router } from "expo-router";
import { db } from "../../../../../database/firebaseConfig";
import { ref, push } from "firebase/database";
import GradientLayout from "../../../../../Utils/gradiente";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Divider } from "@rneui/base";

function PublicarAta() {
  const [ata, setAta] = useState({
    titulo: "",
    conteudo: "",
    data: new Date(),
    local: "",
    participantes: "",
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setAta({ ...ata, data: selectedDate });
    }
  };

  async function publicarAta() {
    if (!ata.titulo || !ata.conteudo || !ata.local) {
      Alert.alert("Atenção", "Preencha todos os campos obrigatórios (*)");
      return;
    }

    setLoading(true);

    try {
      const ataData = {
        titulo: ata.titulo.trim(),
        conteudo: ata.conteudo.trim(),
        data: ata.data.toISOString(),
        local: ata.local.trim(),
        participantes: ata.participantes.trim(),
        dataPublicacao: new Date().toISOString(),
      };

      await push(ref(db, "DadosBelaVista/administracao/atas"), ataData);

      Alert.alert("Sucesso", "Ata publicada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Erro ao publicar ata:", error);
      Alert.alert("Erro", "Não foi possível publicar a ata. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GradientLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card containerStyle={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon
                  name="file-text"
                  type="font-awesome"
                  size={24}
                  color="#f9f9f9"
                />
              </View>
              <Text style={styles.title}>Registrar Nova Ata</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Básicas</Text>
              <Input
                placeholder="Título da Ata *"
                value={ata.titulo}
                onChangeText={(text) => setAta({ ...ata, titulo: text })}
                leftIcon={{
                  type: "material-community",
                  name: "format-title",
                  color: "#f9f9f9",
                }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#f9f9f9"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Conteúdo da Ata *</Text>
              <Input
                placeholder="Descreva os tópicos discutidos..."
                value={ata.conteudo}
                onChangeText={(text) => setAta({ ...ata, conteudo: text })}
                multiline
                numberOfLines={10}
                leftIcon={{
                  type: "material-community",
                  name: "text",
                  color: "#f9f9f9",
                }}
                inputContainerStyle={[styles.inputContainer, { height: 200 }]}
                inputStyle={[
                  styles.inputText,
                  {
                    height: 190,
                    textAlignVertical: "top",
                  },
                ]}
                placeholderTextColor="#f9f9f9"
              />
            </View>
            <Divider style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalhes da Reunião</Text>

              <Input
                placeholder="Participantes (opcional)"
                value={ata.participantes}
                onChangeText={(text) => setAta({ ...ata, participantes: text })}
                leftIcon={{
                  type: "material-community",
                  name: "account-group",
                  color: "#f9f9f9",
                }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputText}
                placeholderTextColor="#f9f9f9"
              />
              <Pressable
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon
                  name="calendar"
                  type="font-awesome"
                  size={20}
                  color="#f9f9f9"
                  containerStyle={styles.dateIcon}
                />
                <Text style={styles.dateText}>
                  {ata.data.toLocaleDateString("pt-BR")}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={ata.data}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.requiredNote}>* Campos obrigatórios</Text>

              <View style={styles.buttonRow}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={publicarAta}
                  disabled={loading}
                  style={[
                    styles.submitButton,
                    loading && styles.disabledButton,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Icon
                        name="send"
                        type="material-community"
                        size={18}
                        color="#FFF"
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.submitButtonText}>Publicar</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    padding: 12,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingVertical: 15,

    flexDirection: "row",
    justifyContent: "center",
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    right: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9f9f9",
    textAlign: "center",
  },
  section: {
    // marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9f9f9",
    marginBottom: 15,
  },
  divider: {
    backgroundColor: "rgba(255,255,255,0.2)",
    height: 1,
    marginVertical: 5,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 2,
    height: 50,
    // with: "100%",
  },
  inputText: {
    color: "#f9f9f9",
    fontSize: 15,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 0,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    with: "100%",
    overflow: "hidden",
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    color: "#f9f9f9",
    fontSize: 15,
  },
  footer: {
    padding: 20,
  },
  requiredNote: {
    fontSize: 11,
    color: "orange",
    textAlign: "right",
    marginBottom: 15,
  },
buttonRow: {
  flexDirection: "row",
  justifyContent: "space-around", // Alterado de 'space-evenly' para 'space-between'
  width: '100%', // Alterado de '96%' para '100%'
  marginHorizontal: 0, // Removido o marginHorizontal
  gap: 12, // Adiciona um espaçamento consistente entre os botões
},
cancelButton: {
  backgroundColor: "#F39C12",
  borderRadius: 8,
  padding: 15,
  alignItems: "center",
  flex: 1, // Isso faz com que ambos os botões tenham o mesmo tamanho
},
submitButton: {
  backgroundColor: "#0F98A1",
  borderRadius: 8,
  padding: 15,
  alignItems: "center",
  flex: 1, // Isso faz com que ambos os botões tenham o mesmo tamanho
  flexDirection: "row",
  justifyContent: "center",
},
  cancelButtonText: {
    color: "#f9f9f9",
    fontWeight: "700",
    fontSize: 14,
  },
 
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default PublicarAta;
