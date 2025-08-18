import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Input,
  Icon,
  Card
} from '@rneui/themed';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set, serverTimestamp, get } from 'firebase/database';

function AnunciarGaragem() {
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
  const [telefone, setTelefone] = useState('');
  const [apartamento, setApartamento] = useState('');

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setNomeUsuario(userData.nome || user.displayName || 'Anônimo');
          setTelefone(userData.telefone || '');
          setApartamento(userData.apartamento || '');
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        setNomeUsuario('Usuário');
      }
    };

    fetchUserData();
  }, [user]);

  const publicarAnuncio = async () => {
    if (!user) {
      Alert.alert('Atenção', 'Você precisa estar logado para anunciar uma vaga');
      return;
    }

    setIsLoading(true);
    
    try {
      const novoAnuncio = {
        valor: valor || 'A combinar',
        observacoes,
        userId: user.uid,
        nome: nomeUsuario,
        telefone,
        apartamento,
        criadoEm: serverTimestamp(),
        status: 'disponível',
         uidAnunciante: auth.currentUser.uid,
      };
      
      const anunciosRef = ref(db, 'DadosBelaVista/administracao/vagasGaragem');
      const novoAnuncioRef = push(anunciosRef);
      
      await set(novoAnuncioRef, novoAnuncio);
      
      Alert.alert('Sucesso', 'Vaga publicada com sucesso!');
      setValor('');
      setObservacoes('');
    } catch (error) {
      console.error('Erro ao publicar:', error);
      Alert.alert('Erro', 'Falha ao publicar a vaga. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card containerStyle={styles.card}>
            <View style={styles.header}>
              <Icon
                name="car"
                type="font-awesome"
                size={24}
                color="#f5f5f5"
              />
              <Text style={styles.title}>Anunciar Vaga de Garagem</Text>
            </View>

            <Input
              placeholder="Valor do Aluguel (opcional)"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
              leftIcon={{
                type: 'material-community',
                name: 'currency-usd',
                color: '#f5f5f5'
              }}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              placeholderTextColor="#f5f5f5"
            />

            <Input
              placeholder="Observações sobre a vaga"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={4}
              leftIcon={{
                type: 'material-community',
                name: 'text',
                color: '#f5f5f5'
              }}
              inputContainerStyle={[styles.inputContainer, { height: 150 }]}
              inputStyle={[styles.inputText, { 
                height: 140, 
                textAlignVertical: 'top' 
              }]}
              placeholderTextColor="#f5f5f5"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Publicando como:</Text>
              <View style={styles.infoRow}>
                <Icon name="user" type="font-awesome" size={16} color="#f5f5f5" />
                <Text style={styles.infoText}>{nomeUsuario}</Text>
              </View>
              {apartamento && (
                <View style={styles.infoRow}>
                  <Icon name="home" type="font-awesome" size={16} color="#f5f5f5" />
                  <Text style={styles.infoText}>Apartamento: {apartamento}</Text>
                </View>
              )}
              {telefone && (
                <View style={styles.infoRow}>
                  <Icon name="phone" type="font-awesome" size={16} color="#f5f5f5" />
                  <Text style={styles.infoText}>Telefone: {telefone}</Text>
                </View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => {
                  setValor('');
                  setObservacoes('');
                }}
              >
                <Text style={styles.cancelButtonText}>Limpar</Text>
              </Pressable>
            
              <Pressable
                onPress={publicarAnuncio}
                disabled={isLoading}
                style={[styles.submitButton, isLoading && styles.disabledButton]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Publicar</Text>
                )}
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientLayout>
  );
}

const styles = {
  scrollContainer: {
    flexGrow: 1,
  },
  card: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: '96%',
    padding: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#f5f5f5',
    marginLeft: 10
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 8,
    height: 50,
    width: '100%'
  },
  inputText: {
    color: '#f5f5f5',
    fontSize: 15,
  },
  infoContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 0,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#f5f5f5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#f5f5f5',
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    width: '96%',
    marginBottom: 12,
    marginHorizontal: '2%'
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F39C12",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: '40%',
  },
  cancelButtonText: {
    color: "#F39C12",
    fontWeight: "bold",
    fontSize: 14
  },
  submitButton: {
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: '40%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14
  },
};

export default AnunciarGaragem;