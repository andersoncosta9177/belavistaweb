import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Card, CheckBox, Icon, Badge, Input } from "@rneui/themed";
import GradientLayout from "../../../../../Utils/gradiente";
import { ref, onValue } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";

const ConvidadosPortaria = () => {
  const [convidados, setConvidados] = useState([]);
  const [search, setSearch] = useState("");

  // ID do morador que a portaria está visualizando
  const uidMorador =  'DdVGD3l013gdBWInRgFAV8rRQUi1'
 // Substitua pelo ID real ou passe por props

  useEffect(() => {
    const convidadosRef = ref(
      db,
      `DadosBelaVista/usuarios/usuarioMorador/${uidMorador}/convidados`
    );

    const unsubscribe = onValue(convidadosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const convidadosArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          nome: value.nome,
          presente: value.presente || false,
        }));
        setConvidados(convidadosArray);
      } else {
        setConvidados([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const totalPresentes = convidados.filter((c) => c.presente).length;

  const convidadosFiltrados = convidados.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <GradientLayout style={styles.container}>
      <Card containerStyle={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <Icon
              name="account-group"
              type="material-community"
              size={24}
              color="#f9f9f9"
            />
            <Text style={styles.headerBadgeText}>{convidados.length}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Lista de Convidados</Text>
            <Text style={styles.headerSubtitle}>
              {totalPresentes} de {convidados.length} presentes
            </Text>
          </View>
          <Badge
            value={totalPresentes}
            status="success"
            badgeStyle={styles.presentBadge}
            textStyle={styles.badgeText}
          />
        </View>
      </Card>

      {convidados.length > 0 && (
        <Input
          placeholder="Pesquisar convidado"
          value={search}
          onChangeText={setSearch}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          leftIcon={{
            type: "material-community",
            name: "magnify",
            color: "#f6f6f6",
          }}
          containerStyle={styles.inputWrapper}
          placeholderTextColor="#f6f6f6"
          cursorColor={"#f6f6f6"}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {convidadosFiltrados.length > 0 ? (
          convidadosFiltrados.map((convidado) => (
            <Card containerStyle={styles.cardItem} key={convidado.id}>
              <View style={styles.itemContainer}>
                <CheckBox
                  checked={convidado.presente}
                  disabled
                  checkedIcon={
                    <Icon
                      name="checkbox-marked"
                      type="material-community"
                      color="#4CAF50"
                      size={28}
                    />
                  }
                  uncheckedIcon={
                    <Icon
                      name="checkbox-blank-outline"
                      type="material-community"
                      color="#9E9E9E"
                      size={28}
                    />
                  }
                  containerStyle={styles.checkbox}
                />
                <View style={styles.itemTextContainer}>
                  <Text
                    style={[
                      styles.itemText,
                      convidado.presente && styles.strikethrough,
                    ]}
                  >
                    {convidado.nome}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card containerStyle={styles.emptyCard}>
            <Icon
              name="account-question"
              type="material-community"
              size={40}
              color="#9E9E9E"
            />
            <Text style={styles.noGuestsText}>Nenhum convidado encontrado</Text>
            <Text style={styles.noGuestsSubtext}>
              Verifique com o morador se ele cadastrou
            </Text>
          </Card>
        )}
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  // mesma definição de estilos do seu código original
  container: { flex: 1 },
  headerCard: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: "94%",
    marginHorizontal: "3%",
    paddingVertical: 20,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    shadowColor: "transparent",
    borderWidth: 0,
    elevation: 0,
  },
  inputContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    width: "99%",
    marginHorizontal: "0.5%",
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderBottomWidth: 0,
  },
  inputText: {
    color: "#f5f5f5",
    fontSize: 14,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 228, 243, 0.5)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f9f9f9",
    marginLeft: 5,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    color: "#f9f9f9",
    fontWeight: "600",
    marginBottom: 2,
    fontSize: 16,
  },
  headerSubtitle: {
    color: "#f5f5f5",
    fontSize: 13,
  },
  presentBadge: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  scrollContent: {},
  cardItem: {
    borderRadius: 2,
    marginBottom: 2,
    paddingVertical: 5,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 0,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    margin: 0,
    padding: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  strikethrough: {
    textDecorationLine: "line-through",
    color: "#9E9E9E",
  },
  emptyCard: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    marginHorizontal: 10,
  },
  noGuestsText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
  },
  noGuestsSubtext: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
});

export default ConvidadosPortaria;
