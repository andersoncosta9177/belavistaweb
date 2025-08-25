import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StatusBar,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { ref, push, get, query } from "firebase/database";
import { db } from "../../../../../database/firebaseConfig";
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { Button, Input, Icon } from "@rneui/themed";
import {getUserId} from "../../../../../Utils/auth/getUser";  
import { buscarDadosUsuarioMorador } from "../../../../../Utils/auth/getUser";
import { getAuth } from "firebase/auth";
function AgendamentosMoradores() {
  const [tipo, setTipo] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [data, setData] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [datasOcupadas, setDatasOcupadas] = useState([]); // Armazena datas ocupadas
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const navigation = useNavigation();
    const [idMorador, setIdMorador] = useState(null); // Alterado para estado
const [dadosUsuario, setDadosUsuario] = useState(null);
const [loadingUserData, setLoadingUserData] = useState(true);


useEffect(() => {
  const fetchUserData = async () => {
    try {
      // Limpa os estados antes de buscar novos dados
      setNome("");
      setApartamento("");
      setDadosUsuario(null);
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.log("Nenhum usuário logado");
        return;
      }

      const uid = user.uid;
      setIdMorador(uid);
      
      const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("Dados do usuário logado:", userData); // Verifique no console
        
        setDadosUsuario(userData);
        setNome(userData.nome || "");
        setApartamento(userData.apartamento || "");
      } else {
        console.log("Nenhum dado encontrado para o usuário");
        Alert.alert("Aviso", "Seus dados não foram encontrados");
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      Alert.alert("Erro", "Falha ao carregar seus dados");
    } finally {
      setLoadingUserData(false);
    }
  };

  fetchUserData();
}, []);




  useEffect(() => {
    async function buscarDatasOcupadas() {
      if (!idMorador) return;

      try {
        // CORREÇÃO: Adicionar a barra antes do ID
        const minhaAgendaRef = ref(db, `DadosBelaVista/DadosGerais/Reservas`);
        console.log("Caminho do Firebase:", `DadosBelaVista/DadosGerais/Reservas`);
        
        const snapshot = await get(minhaAgendaRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const ocupadas = Object.values(data).map((item) => ({
            tipo: item.tipo,
            data: item.data, // Mantém como string no formato "YYYY-MM-DD"
          }));
          setDatasOcupadas(ocupadas);
        } else {
          console.log("Nenhum agendamento encontrado para este usuário");
        }
      } catch (error) {
        console.error("Erro detalhado:", {
          message: error.message,
          code: error.code,
          path: `DadosBelaVista/DadosGerais/Reservas/${idMorador}`
        });
        Alert.alert("Erro", "Falha ao carregar agendamentos existentes");
      }
    }

    buscarDatasOcupadas();
  }, [idMorador]);







  const showDatePicker = () => setShowPicker(true);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || data;
    setShowPicker(false);
    setData(currentDate);
  };

async function salvarAgendamento() {
  if (!tipo || !nome || !cpf) {
    Alert.alert("Erro", "Preencha todos os campos antes de enviar.");
    return;
  }

  if (!idMorador || !dadosUsuario) {
    Alert.alert("Erro", "Dados do usuário não carregados.");
    return;
  }

  const diaEvento = String(data.getDate()).padStart(2, "0");
  const mesEvento = String(data.getMonth() + 1).padStart(2, "0");
  const anoEvento = data.getFullYear();
  const dataEvento = `${anoEvento}-${mesEvento}-${diaEvento}`;

  try {
    // Verifica disponibilidade em TODOS os usuários
    const reservasRef = ref(db, 'DadosBelaVista/DadosGerais/Reservas');
    const snapshot = await get(reservasRef);
    
    if (snapshot.exists()) {
      const todosAgendamentos = snapshot.val();
      
      for (const userId in todosAgendamentos) {
        const agendamentosDoUsuario = todosAgendamentos[userId];
        
        for (const agendamentoId in agendamentosDoUsuario) {
          const ag = agendamentosDoUsuario[agendamentoId];
          if (ag.dataEvento === dataEvento && ag.tipo === tipo) {
            Alert.alert("Conflito", `Já existe ${tipo} agendado para ${diaEvento}/${mesEvento}/${anoEvento}`);
            return;
          }
        }
      }
    }

    // Formata data de criação
    const dataCriacao = new Date().toISOString();

    // Salva no nó do usuário logado
    const userAgendamentosRef = ref(db, `DadosBelaVista/DadosGerais/Reservas`);
    
    await push(userAgendamentosRef, {
      tipo,
      nome,
      cpf,
      apartamento: dadosUsuario.apartamento, // Usa o apartamento do usuário
      dataEvento,
      dataCriacao,
      criadoPor: idMorador
    });

    Alert.alert("Sucesso", "Agendamento realizado com sucesso!");
    navigation.goBack();
    
  } catch (error) {
    console.error("Erro ao salvar agendamento:", error);
    Alert.alert("Erro", "Não foi possível salvar o agendamento.");
  }
}




  return (
    <GradientLayout style={styles.container}>

      <View style={styles.content}>
        <Text style={styles.title}>Agendar Mudança ou Evento</Text>

        {/* Tipo Selection Button */}
        <Button
          title={tipo || "Selecione o Tipo"}
          titleStyle={styles.buttonTitle}
          buttonStyle={styles.selectionButton}
          containerStyle={styles.buttonContainer}
          onPress={() => setShowModal(true)}
          icon={
            <Icon
              name={tipo ? "check-circle" : "chevron-down"}
              type="material-community"
              color="#EDE9D5"
              size={20}
              style={styles.buttonIcon}
            />
          }
          iconRight
        />

        {/* Input Fields */}
      <Input
  placeholder="Nome do morador"
  value={nome}
  onChangeText={setNome} // Mantém editável se precisar corrigir
  containerStyle={styles.inputContainer}
  inputStyle={styles.inputText}
  placeholderTextColor="#EDE9D5"
  leftIcon={
    <Icon
      name="account"
      type="material-community"
      size={20}
      color="#EDE9D5"
    />
  }
/>

        <Input
          placeholder="CPF"
          value={cpf}
          onChangeText={setCpf}
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor="#EDE9D5"
          keyboardType="numeric"
          leftIcon={
            <Icon
              name="card-account-details"
              type="material-community"
              size={20}
              color="#EDE9D5"
            />
          }
        />

      <Input
  placeholder="N° apartamento"
  value={apartamento}
  editable={false} // Impede edição
  containerStyle={styles.inputContainer}
  inputStyle={styles.inputText}
  placeholderTextColor="#EDE9D5"
  leftIcon={
    <Icon
      name="home"
      type="material-community"
      size={20}
      color="#EDE9D5"
    />
  }
/>

        {/* Date Picker Button */}
        <Button
          title={`Data: ${data.toLocaleDateString("pt-BR")}`}
          titleStyle={styles.buttonTitle}
          buttonStyle={styles.selectionButton}
          containerStyle={styles.buttonContainer}
          onPress={showDatePicker}
          icon={
            <Icon
              name="calendar"
              type="material-community"
              color="#EDE9D5"
              size={20}
              style={styles.buttonIcon}
            />
          }
          iconRight
        />

        {showPicker && (
          <DateTimePicker
            value={data}
            mode="date"
            display="default"
            onChange={onChange}
            minimumDate={new Date()}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
      
          <Button
            title="Agendar"
            titleStyle={styles.submitButtonText}
            buttonStyle={styles.submitButton}
            containerStyle={styles.actionButtonContainer}
            onPress={salvarAgendamento}
          />
              <Button
            title="Cancelar"
            type="outline"
            titleStyle={styles.cancelButtonText}
            buttonStyle={styles.cancelButton}
            containerStyle={styles.actionButtonContainer}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>

      {/* Type Selection Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Tipo</Text>
            
            <Button
              title="Mudança"
              buttonStyle={styles.modalOptionButton}
              containerStyle={styles.modalButtonContainer}
              onPress={() => {
                setTipo("mudança");
                setShowModal(false);
              }}
              icon={
                <Icon
                  name="truck-delivery"
                  type="material-community"
                  color="#EDE9D5"
                  size={20}
                  style={styles.modalIcon}
                />
              }
            />
            
            <Button
              title="Evento"
              buttonStyle={styles.modalOptionButton}
              containerStyle={styles.modalButtonContainer}
              onPress={() => {
                setTipo("evento");
                setShowModal(false);
              }}
              icon={
                <Icon
                  name="party-popper"
                  type="material-community"
                  color="#EDE9D5"
                  size={20}
                  style={styles.modalIcon}
                />
              }
            />
            
            <Button
              title="Cancelar"
              type="outline"
              buttonStyle={styles.modalCancelButton}
              containerStyle={styles.modalButtonContainer}
              titleStyle={styles.modalCancelText}
              onPress={() => setShowModal(false)}
            />
          </View>
        </View>
      </Modal>
    </GradientLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EDE9D5',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  selectionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#EDE9D5',
  },
  buttonTitle: {
    color: '#EDE9D5',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputText: {
    color: '#EDE9D5',
    paddingLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButtonContainer: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EDE9D5',
  },
  submitButtonText: {
    color: '#EDE9D5',
    fontWeight: '600',
  },
  cancelButton: {
    borderColor: '#EDE9D5',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    backgroundColor: '#F39C12',
  },
  cancelButtonText: {
    color: '#EDE9D5',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#0F98A1',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    borderWidth: 2,
    borderColor: '#EDE9D5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EDE9D5',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButtonContainer: {
    marginBottom: 15,
  },
  modalOptionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EDE9D5',
  },
  modalIcon: {
    marginRight: 10,
  },
  modalCancelButton: {
    borderColor: '#EDE9D5',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    backgroundColor: '#F39C12',
  },
  modalCancelText: {
    color: '#EDE9D5',
    fontWeight: '600',
  },
});
export default AgendamentosMoradores;