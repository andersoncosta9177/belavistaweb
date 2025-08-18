import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { Input } from "@rneui/themed";
import { ref, set, get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../../../../src/database/firebaseConfig";
import GradientLayout from "../../../../../src/Utils/gradiente";
import { FontAwesome } from "@expo/vector-icons";
import { Link } from "expo-router";

const RegistroEncomendas = () => {
  // Estados
  const [form, setForm] = useState({
    apartamento: "",
    nomeMorador: "",
    numeroRastreamento: "",
  });
  const [nomePorteiro, setNomePorteiro] = useState("");
  const [loading, setLoading] = useState(false);

  // Referências para os campos
  const moradorRef = useRef(null);
  const rastreamentoRef = useRef(null);

  // Busca o nome do porteiro
  useEffect(() => {
    const buscarPorteiro = async () => {
      try {
        const codigo = await AsyncStorage.getItem("codigo");
        if (!codigo) throw new Error("Código não encontrado");

        const snapshot = await get(
          ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}/nome`)
        );
        if (snapshot.exists()) {
          setNomePorteiro(snapshot.val());
        }
      } catch (error) {
        Alert.alert("Erro", error.message);
      }
    };

    buscarPorteiro();
  }, []);

  // Atualiza o formulário
  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submete o formulário
  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!form.apartamento.trim())
      return Alert.alert("Atenção", "Informe o apartamento");
    if (!form.nomeMorador.trim())
      return Alert.alert("Atenção", "Informe o morador");
    if (!form.numeroRastreamento.trim())
      return Alert.alert("Atenção", "Informe o rastreamento");
    if (!nomePorteiro.trim())
      return Alert.alert("Atenção", "Porteiro não identificado");

    try {
      setLoading(true);

      await set(
        ref(
          db,
          `DadosBelaVista/DadosMoradores/encomendas/encomendasPendentes/${Date.now()}`
        ),
        {
          ...form,
          numeroRastreamento: form.numeroRastreamento.toUpperCase(),
          dataRegistro: new Date().toISOString(),
          nomePorteiroRecebedor: nomePorteiro,
        }
      );

      Alert.alert("Sucesso", "Encomenda registrada!");
      setForm({ apartamento: "", nomeMorador: "", numeroRastreamento: "" });
    } catch (error) {
      Alert.alert("Erro", "Falha ao registrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientLayout style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>📦 Registro de Encomendas</Text>

            {nomePorteiro && (
              <View style={styles.porteiroContainer}>
                <FontAwesome name="id-badge" size={16} color="#EDE9D5" />
                <Text style={styles.porteiroText}>
                  Porteiro: {nomePorteiro}
                </Text>
              </View>
            )}

            <Input
              placeholder="Número do apartamento"
              placeholderTextColor="#EDE9D5AA"
              value={form.apartamento}
              onChangeText={(text) => handleChange("apartamento", text)}
              keyboardType="numeric"
              returnKeyType="next"
              onSubmitEditing={() => moradorRef.current?.focus()}
              leftIcon={
                <FontAwesome name="building" size={18} color="#EDE9D5" />
              }
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              containerStyle={styles.inputWrapper}
            />

            <Input
              ref={moradorRef}
              placeholder="Nome do morador"
              placeholderTextColor="#EDE9D5AA"
              value={form.nomeMorador}
              onChangeText={(text) => handleChange("nomeMorador", text)}
              returnKeyType="next"
              onSubmitEditing={() => rastreamentoRef.current?.focus()}
              leftIcon={<FontAwesome name="user" size={18} color="#EDE9D5" />}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              containerStyle={styles.inputWrapper}
            />

            <Input
              ref={rastreamentoRef}
              placeholder="Código de rastreamento"
              placeholderTextColor="#EDE9D5AA"
              value={form.numeroRastreamento}
              onChangeText={(text) =>
                handleChange("numeroRastreamento", text.toUpperCase())
              }
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              leftIcon={
                <FontAwesome name="barcode" size={18} color="#EDE9D5" />
              }
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              containerStyle={styles.inputWrapper}
            />

            <View style={styles.buttonRow}>
              <Link href="../encomendas" asChild>
                <Pressable style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
              </Link>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.submitButton, loading && styles.disabledButton]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Registrar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "96%",
    marginHorizontal: "2%",
    paddingVertical: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    color: "#EDE9D5",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  porteiroContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "80%",
    marginHorizontal: "10%",
    borderRadius: 7,
  },
  porteiroText: {
    color: "#EDE9D5",
    marginLeft: 10,
    fontSize: 14,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: "rgba(237, 233, 213, 0.2)",
    paddingHorizontal: 15,
    borderRadius: 5,
    width: "94%",
    marginHorizontal: "3%",
    justifyContent: "center",
    alignItems: "center",
  },
  inputText: {
    color: "#EDE9D5",
    paddingLeft: 10,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    width: "94%",
    marginHorizontal: "3%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F39C12",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#F39C12",
    fontWeight: "bold",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default RegistroEncomendas;
