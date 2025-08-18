import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { ref, onValue, remove, update, set } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import GradientLayout from '../../../../../../src/Utils/gradiente';

const { width } = Dimensions.get('window');

const TokensUsers = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [moradores, setMoradores] = useState([]);
  const [copiedItem, setCopiedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [funcaoEditada, setFuncaoEditada] = useState('');
  const [telefoneEditado, setTelefoneEditado] = useState('');
  const [activeTab, setActiveTab] = useState('moradores');

  useEffect(() => {
    const fetchFuncionarios = () => {
      const funcionarioRef = ref(db, 'DadosBelaVista/RegistroFuncionario/Tokens');
      onValue(funcionarioRef, (snapshot) => {
        const data = snapshot.val();
        const funcionariosList = data ? Object.values(data) : [];
        setFuncionarios(funcionariosList);
      });
    };

    const fetchMoradores = () => {
      const moradoresRef = ref(db, 'DadosBelaVista/usuarios/usuarioCondominio');
      onValue(moradoresRef, (snapshot) => {
        const data = snapshot.val();
        const moradoresList = data ? Object.values(data) : [];
        setMoradores(moradoresList);
        setLoading(false);
      });
    };

    fetchFuncionarios();
    fetchMoradores();
  }, []);

  const copyToClipboard = (code, id) => {
    Clipboard.setStringAsync(code);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const deletarFuncionario = (codigo) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este funcionário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              const funcionarioRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}`);
              await remove(funcionarioRef);
              setFuncionarios((prev) => prev.filter((item) => item.codigo !== codigo));
              Alert.alert('Sucesso', 'Funcionário deletado com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar funcionário:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao deletar o funcionário.');
            }
          },
        },
      ]
    );
  };

  const deletarMorador = (codigoMorador) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja deletar este morador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              const moradorRef = ref(db, `DadosBelaVista/usuarios/usuarioCondominio/${codigoMorador}`);
              await remove(moradorRef);
              setMoradores((prev) => prev.filter((item) => item.codigoMorador !== codigoMorador));
              Alert.alert('Sucesso', 'Morador deletado com sucesso!');
            } catch (error) {
              console.error('Erro ao deletar morador:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao deletar o morador.');
            }
          },
        },
      ]
    );
  };

  const abrirModalEdicao = (funcionario) => {
    setEditingFuncionario(funcionario);
    setNomeEditado(funcionario.nome);
    setFuncaoEditada(funcionario.funcao);
   setTelefoneEditado(funcionario.telefone || ''); // Garante que não será undefined
    setModalVisible(true);
  };

const salvarEdicoes = async () => {
  if (!nomeEditado.trim() || !funcaoEditada.trim() || !telefoneEditado.trim()) {
    Alert.alert('Erro', 'Nome, função e telefone são obrigatórios.');
    return;
  }

  try {
    const funcionarioRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${editingFuncionario.codigo}`);
    await update(funcionarioRef, {
      nome: nomeEditado.trim(),
      funcao: funcaoEditada.trim(),
      telefone: telefoneEditado.trim(), // Corrigido aqui
    });

    setFuncionarios((prev) =>
      prev.map((item) =>
        item.codigo === editingFuncionario.codigo
          ? { 
              ...item, 
              nome: nomeEditado.trim(), 
              funcao: funcaoEditada.trim(), 
              telefone: telefoneEditado.trim() // Corrigido aqui
            }
          : item
      )
    );

    setModalVisible(false);
    Alert.alert('Sucesso', 'Funcionário atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    Alert.alert('Erro', 'Ocorreu um erro ao atualizar o funcionário.');
  }
};

  if (loading) {
    return (
      <GradientLayout style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container}>
     

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gerenciamento de Acessos</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'moradores' && styles.activeTab]}
          onPress={() => setActiveTab('moradores')}
        >
          <Text style={[styles.tabText, activeTab === 'moradores' && styles.activeTabText]}>
            Moradores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'funcionarios' && styles.activeTab]}
          onPress={() => setActiveTab('funcionarios')}
        >
          <Text style={[styles.tabText, activeTab === 'funcionarios' && styles.activeTabText]}>
            Funcionários
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'moradores' ? (
          <>
            <Text style={styles.sectionTitle}>Lista de Moradores</Text>
            {moradores.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-question" size={50} color="rgba(255,255,255,0.7)" />
                <Text style={styles.emptyText}>Nenhum morador cadastrado</Text>
              </View>
            ) : (
              moradores.map((item) => (
                <View key={item.codigoMorador} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <FontAwesome name="user-circle" size={24} color="#2c3e50" />
                    <Text style={styles.cardTitle}>Morador</Text>
                  </View>
                  
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Código:</Text>
                      <View style={styles.codeContainer}>
                        <Text style={styles.codeText}>{item.codigoMorador}</Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(item.codigoMorador, `morador-${item.codigoMorador}`)}
                          style={styles.copyButton}
                        >
                          <Ionicons 
                            name="copy-outline" 
                            size={20} 
                            color={copiedItem === `morador-${item.codigoMorador}` ? "#27ae60" : "#2c3e50"} 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {copiedItem === `morador-${item.codigoMorador}` && (
                      <Text style={styles.copiedMessage}>Código copiado!</Text>
                    )}
                  </View>
                  
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deletarMorador(item.codigoMorador)}
                    >
                      <MaterialCommunityIcons name="delete" size={24} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Lista de Funcionários</Text>
            {funcionarios.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-hard-hat" size={50} color="rgba(255,255,255,0.7)" />
                <Text style={styles.emptyText}>Nenhum funcionário cadastrado</Text>
              </View>
            ) : (
              funcionarios.map((item) => (
                <View key={item.codigo} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="badge-account" size={24} color="#2c3e50" />
                    <Text style={styles.cardTitle}>Funcionário</Text>
                  </View>
                  
                  <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Nome:</Text>
                      <Text style={styles.infoValue}>{item.nome}</Text>
                    </View>
                      <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Telefone:</Text>
                      <Text style={styles.infoValue}>{item.telefone}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Função:</Text>
                      <Text style={styles.infoValue}>{item.funcao}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Código:</Text>
                      <View style={styles.codeContainer}>
                        <Text style={styles.codeText}>{item.codigo}</Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(item.codigo, `func-${item.codigo}`)}
                          style={styles.copyButton}
                        >
                          <Ionicons 
                            name="copy-outline" 
                            size={20} 
                            color={copiedItem === `func-${item.codigo}` ? "#27ae60" : "#2c3e50"} 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {copiedItem === `func-${item.codigo}` && (
                      <Text style={styles.copiedMessage}>Código copiado!</Text>
                    )}
                  </View>
                  
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => abrirModalEdicao(item)}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color="#3498db" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deletarFuncionario(item.codigo)}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Funcionário</Text>
            
            <TextInput
              placeholder="Nome completo"
              value={nomeEditado}
              onChangeText={setNomeEditado}
              style={styles.modalInput}
              placeholderTextColor="#999"
            />

              <TextInput
              placeholder="Telefone"
              value={telefoneEditado}
              onChangeText={setTelefoneEditado}
              style={styles.modalInput}
              placeholderTextColor="#999"
              keyboardType="phone-pad" // Adicione isso para melhor experiência
            />
            
            <TextInput
              placeholder="Função/Cargo"
              value={funcaoEditada}
              onChangeText={setFuncaoEditada}
              style={styles.modalInput}
              placeholderTextColor="#999"
            />
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarEdicoes}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardBody: {
    marginBottom: 12,

  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#2c3e50',
    fontWeight: '600',
    width: '30%',
  },
  infoValue: {
    color: '#34495e',
    flex: 1,
    textAlign: 'right',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  codeText: {
    color: '#34495e',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  copiedMessage: {
    color: '#27ae60',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
    paddingTop: 12,

  },
  actionButton: {
    marginLeft: 16,
    padding: 6,
  },
  deleteButton: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default TokensUsers;