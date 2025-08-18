import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ActivityIndicator,
  Text,
  Modal,
  TouchableOpacity
} from "react-native";
import { Input, Icon } from "@rneui/base";
import { db } from "../../../../../database/firebaseConfig";
import { ref, set } from 'firebase/database';
import { Link } from "expo-router";
import GradientLayout from "../../../../../../src/Utils/gradiente";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const RegistroTokens = () => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [funcao, setFuncao] = useState('');
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFuncaoModal, setShowFuncaoModal] = useState(false);

  const gerarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

  const validarCampos = () => {
    const errosTemp = {};
    if (!nome.trim()) errosTemp.nome = 'Nome é obrigatório';
    if (!funcao.trim()) errosTemp.funcao = 'Função é obrigatória';
    if (!telefone.trim()) errosTemp.telefone = 'Telefone é obrigatório';
    return errosTemp;
  };

  const handleCadastro = async () => {
    const errosTemp = validarCampos();
    if (Object.keys(errosTemp).length > 0) {
      setErros(errosTemp);
      return;
    }

    setErros({});
    setLoading(true);

    try {
      const codigo = gerarCodigo();
      const funcionarioRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}`);
      await set(funcionarioRef, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        funcao: funcao.trim(),
        emServico: false,
        codigo: codigo,
        status: false
      });

      Alert.alert('Sucesso', 'Funcionário cadastrado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            setNome('');
            setTelefone('');
            setFuncao('');
          },
        },
      ]);
    } catch (error) {
      console.log('Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Erro ao cadastrar funcionário.');
    } finally {
      setLoading(false);
    }
  };

  const selecionarFuncao = (valor) => {
    setFuncao(valor);
    setShowFuncaoModal(false);
  };

  return (
    <GradientLayout style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registro de Funcionários</Text>
            
            <Input
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              errorMessage={erros.nome}
              errorStyle={styles.errorText}
              inputStyle={styles.inputText}
              placeholderTextColor={styles.placeholderText.color}
              leftIcon={
                <Icon
                  name="account-outline"
                  type="material-community"
                  size={24}
                  color={styles.icon.color}
                />
              }
              inputContainerStyle={[
                styles.inputContainer,
                erros.nome && styles.inputError
              ]}
            />

            <Input
              placeholder="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              errorMessage={erros.telefone}
              errorStyle={styles.errorText}
              inputStyle={styles.inputText}
              keyboardType="phone-pad"
              placeholderTextColor={styles.placeholderText.color}
              leftIcon={
                <Icon
                  name="phone-outline"
                  type="material-community"
                  size={24}
                  color={styles.icon.color}
                />
              }
              inputContainerStyle={[
                styles.inputContainer,
                erros.telefone && styles.inputError
              ]}
            />
            
            {/* Seletor de Função Personalizado */}
            <View style={styles.funcaoContainer}>
              <Text style={styles.label}>Função/Cargo</Text>
              <TouchableOpacity 
                style={[
                  styles.funcaoSelector,
                  erros.funcao && styles.inputError
                ]}
                onPress={() => setShowFuncaoModal(true)}
              >
                <Icon
                  name="briefcase-outline"
                  type="material-community"
                  size={24}
                  color={styles.icon.color}
                  style={styles.funcaoIcon}
                />
                <Text style={styles.funcaoText}>
                  {funcao || "Selecione a função"}
                </Text>
                <Icon
                  name="chevron-down"
                  type="material-community"
                  size={24}
                  color={styles.icon.color}
                />
              </TouchableOpacity>
              {erros.funcao && <Text style={styles.errorText}>{erros.funcao}</Text>}
            </View>

            {/* Modal de Seleção de Função */}
            <Modal
              visible={showFuncaoModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowFuncaoModal(false)}
            >
              <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1}
                onPressOut={() => setShowFuncaoModal(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecione a Função</Text>
                    
                    <TouchableOpacity 
                      style={styles.modalOption}
                      onPress={() => selecionarFuncao('Porteiro')}
                    >
                      <MaterialCommunityIcons name="security" size={24} color="#4F46E5" />
                      <Text style={styles.modalOptionText}>Porteiro</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.modalOption}
                      onPress={() => selecionarFuncao('Zelador')}
                    >
                      <MaterialCommunityIcons name="tools" size={24} color="#4F46E5" />
                      <Text style={styles.modalOptionText}>Zelador</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.modalCancel}
                      onPress={() => setShowFuncaoModal(false)}
                    >
                      <Text style={styles.modalCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
            
            <View style={styles.buttonRow}>
              <Link href="../" asChild>
                <Pressable style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
              </Link>
              
              <Pressable
                onPress={handleCadastro}
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    borderRadius: 18,
    padding: 25,
    width: '94%',
    marginHorizontal: '3%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFFFFF',
  },
  inputContainer: {
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
  },
  inputError: {
    borderColor: '#FF5252',
    borderWidth: 1,
  },
  inputText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#AAAAAA',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 10,
  },
  icon: {
    color: '#FFFFFF',
  },
  funcaoContainer: {
    marginBottom: 15,
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
    marginLeft: 10,
  },
  funcaoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  funcaoIcon: {
    marginRight: 10,
  },
  funcaoText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1E293B',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#1E293B',
  },
  modalCancel: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
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

export default RegistroTokens;