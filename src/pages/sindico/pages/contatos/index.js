import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Clipboard,
  Dimensions
} from 'react-native';
import { Text, Button, Icon, Card, Divider } from '@rneui/themed';
import GradientLayout from '../../../../../src/Utils/gradiente';
import { 
  ref, 
  push, 
  set, 
  update,
  remove,
  onValue
} from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

function ContatosScreen() {
  const [contatos, setContatos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [contatoEditando, setContatoEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(true);

  const CONTATOS_COLLECTION = 'DadosBelaVista/administracao/contatos';

  useEffect(() => {
    const contatosRef = ref(db, CONTATOS_COLLECTION);
    
    const unsubscribe = onValue(contatosRef, (snapshot) => {
      const data = snapshot.val();
      const contatosArray = [];
      
      if (data) {
        Object.keys(data).forEach(key => {
          contatosArray.push({
            id: key,
            ...data[key]
          });
        });
        
        contatosArray.sort((a, b) => a.nome.localeCompare(b.nome));
      }
      
      setContatos(contatosArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const validarTelefone = (telefone) => {
    const regex = /^(\d{2}\s?\d{4,5}\s?\d{4})$/;
    return regex.test(telefone);
  };

  const copiarParaAreaTransferencia = (texto) => {
    Clipboard.setString(texto);
    Alert.alert('Telefone copiado para a área de transferência.');
  };

  const openAddModal = () => {
    setContatoEditando(null);
    setFormData({
      nome: '',
      telefone: ''
    });
    setModalVisible(true);
  };

  const openEditModal = (contato) => {
    setContatoEditando(contato);
    setFormData({
      nome: contato.nome,
      telefone: contato.telefone
    });
    setModalVisible(true);
  };

  const salvarContato = async () => {
    if (!formData.nome || !formData.telefone) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    
    if (!validarTelefone(formData.telefone)) {
      Alert.alert('Atenção', 'Por favor, insira um telefone válido (ex: 11 987654321)');
      return;
    }
    
    try {
      setLoading(true);
      
      if (contatoEditando) {
        await update(ref(db, `${CONTATOS_COLLECTION}/${contatoEditando.id}`), formData);
        Alert.alert('Sucesso', 'Contato atualizado com sucesso');
      } else {
        const novoContatoRef = push(ref(db, CONTATOS_COLLECTION));
        await set(novoContatoRef, formData);
        Alert.alert('Sucesso', 'Contato adicionado com sucesso');
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      Alert.alert('Erro', error.code === 'PERMISSION_DENIED' 
        ? 'Você não tem permissão para esta ação' 
        : 'Não foi possível salvar o contato');
    } finally {
      setLoading(false);
    }
  };

  const excluirContato = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este contato?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Excluir", 
          onPress: async () => {
            try {
              setLoading(true);
              await remove(ref(db, `${CONTATOS_COLLECTION}/${id}`));
              Alert.alert('Sucesso', 'Contato removido com sucesso');
            } catch (error) {
              console.error('Erro ao remover contato:', error);
              Alert.alert('Erro', error.code === 'PERMISSION_DENIED' 
                ? 'Você não tem permissão para excluir contatos' 
                : 'Não foi possível remover o contato');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && contatos.length === 0) {
    return (
      <GradientLayout style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F98A1" />
          <Text style={styles.loadingText}>Carregando contatos...</Text>
        </View>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Icon name="phone" type="font-awesome" size={30} color="#f9f9f9" />

        <Text style={styles.title}> Contatos do Condomínio</Text>
      </View>

      {/* Lista de Contatos */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {contatos.length === 0 ? (
          <Card containerStyle={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Icon 
                name="address-book" 
                type="font-awesome" 
                size={40} 
                color="#0F98A1" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>Nenhum contato cadastrado</Text>
              <Button
                title="Adicionar Primeiro Contato"
                buttonStyle={styles.addFirstButton}
                titleStyle={styles.addFirstButtonText}
                onPress={openAddModal}
                icon={
                  <Icon 
                    name="plus" 
                    type="font-awesome" 
                    size={16} 
                    color="white" 
                    style={{marginRight: 8}}
                  />
                }
              />
            </View>
          </Card>
        ) : (
          contatos.map(contato => (
            <Card key={contato.id} containerStyle={styles.contatoCard}>
              <View style={styles.contatoHeader}>
                <View style={styles.contatoInfo}>
                  <Icon 
                    name="user" 
                    type="font-awesome" 
                    size={20} 
                    color="#4bdae4ff" 
                    style={styles.contatoIcon}
                  />
                  <Text style={styles.contatoNome}>{contato.nome}</Text>
                </View>
                
              </View>
              
              <View style={styles.contatoHeader}>
                <View style={styles.contatoInfo}>
                  <Icon 
                    name="phone" 
                    type="font-awesome" 
                    size={20} 
                    color="#4bdae4ff" 
                    style={styles.contatoIcon}
                  />
                  <Text style={styles.contatoTelefone}>{formatarTelefone(contato.telefone)}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.copyButton} 
                  onPress={() => copiarParaAreaTransferencia(contato.telefone)}
                >
                  <Icon 
                    name="copy" 
                    type="font-awesome" 
                    size={20} 
                    color="#4bdae4ff" 
                  />
                </TouchableOpacity>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.contatoActions}>
                <Button
                  buttonStyle={styles.actionButton}
                  icon={{
                    name: 'pencil',
                    type: 'material-community',
                    size: 22,
                    color: '#FFF'
                  }}
                  onPress={() => openEditModal(contato)}
                  disabled={loading}
                />
                
                <Button
                  buttonStyle={styles.actionButton}
                  icon={{
                    name: 'trash-can',
                    type: 'material-community',
                    size: 22,
                    color: '#e74c3c'
                  }}
                  onPress={() => excluirContato(contato.id)}
                  disabled={loading}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Botão Flutuante para Adicionar */}
      {contatos.length > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={openAddModal}
          disabled={loading}
        >
          <LinearGradient
            colors={['#0F98A1', '#0FBBA6']}
            style={styles.floatingButtonGradient}
          >
            <Icon 
              name="plus" 
              type="font-awesome" 
              size={24} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Modal do Formulário */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !loading && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient 
            colors={['#4568DC', '#B06AB3']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Icon 
                name={contatoEditando ? 'pencil' : 'plus'} 
                type="material-community" 
                size={24} 
                color="#FFF" 
              />
              <Text style={styles.modalTitle}>
                {contatoEditando ? 'Editar Contato' : 'Novo Contato'}
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Icon 
                name="account" 
                type="material-community" 
                size={20} 
                color="#FFF" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nome (ex: Administração)"
                placeholderTextColor="#DDD"
                value={formData.nome}
                onChangeText={(text) => setFormData({...formData, nome: text})}
                editable={!loading}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Icon 
                name="phone" 
                type="material-community" 
                size={20} 
                color="#FFF" 
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefone (ex: 11 98765-4321)"
                placeholderTextColor="#DDD"
                value={formData.telefone}
                onChangeText={(text) => setFormData({...formData, telefone: text})}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => !loading && setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={salvarContato}
                disabled={loading || !formData.nome || !formData.telefone}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {contatoEditando ? 'Atualizar' : 'Salvar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </GradientLayout>
  );
}

const formatarTelefone = (telefone) => {
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  if (apenasNumeros.length === 10) {
    return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } 
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 10,
  },
  header: {
    marginVertical: 15,
    // paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontWeight: 'condensedBold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
    left: 7
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  contatoCard: {
     borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    paddingVertical: 10,
    overflow: "hidden",
    width: "96%",
    marginHorizontal: "2%",
  },
  contatoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contatoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  contatoIcon: {
    marginRight: 10,
  },
  contatoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  contatoTelefone: {
    fontSize: 15,
    color: '#FFF',
    flex: 1,
  },
  copyButton: {
    padding: 5,
    marginRight: 15,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 1,
  },
  contatoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    width: '100%',
  },
  actionButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
  },
  emptyCard: {
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    paddingVertical: 10,
    overflow: "hidden",
    width: "96%",
    marginHorizontal: "2%",
  },
  emptyContent: {
    alignItems: 'center',
    marginVertical: 10,
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addFirstButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: '94%',
    marginHorizontal: '3%',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  saveButton: {
    backgroundColor: '#0F98A1',
      borderWidth: 0.4,
    borderColor: '#FFF',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#FFF',
    fontSize: 16,
  },
});

export default ContatosScreen;