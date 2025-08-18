import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Icon } from '@rneui/base';
import { getDatabase, ref, push,get,set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { db } from '../../../../../database/firebaseConfig';

const ManutencaoForm = ({ route }) => {
  // Estados do componente
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputHeight, setInputHeight] = useState(100);
  const [idMorador, setIdMorador] = useState(null);
  const [apartamentoUsuario, setApartamentoUsuario] = useState("");
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [nomeMorador, setNomeMorador] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true); // Ativa loading ao buscar dados do usuário
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.log("Nenhum usuário logado");
          Alert.alert("Erro", "Usuário não autenticado");
          return;
        }

        const uid = user.uid;
        setIdMorador(uid);
        
        const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setDadosUsuario(userData);
          setApartamentoUsuario(userData.apartamento || "");
          setNomeMorador(userData.nome || "");
        } else {
          console.log("Nenhum dado encontrado para o usuário");
          Alert.alert("Aviso", "Seus dados não foram encontrados");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        Alert.alert("Erro", "Falha ao carregar seus dados");
      } finally {
        setLoading(false); // Desativa loading em todos os casos
      }
    };

    fetchUserData();
  }, []);

  // Função para salvar o pedido de manutenção
  const salvarPedido = async () => {
    // Validação dos campos
    if (!titulo || !descricao) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!idMorador || !apartamentoUsuario || !nomeMorador) {
      Alert.alert('Erro', 'Dados do usuário incompletos. Tente novamente.');
      return;
    }

    setLoading(true);

    try {
      // Cria o objeto com todos os dados necessários
      const novoPedido = {
        titulo,
        descricao,
        status: false, // Por padrão, o pedido começa como não concluído
        data: new Date().toISOString(),
        apartamento: apartamentoUsuario,
        nomeMorador: nomeMorador,
        userId: idMorador
      };

      // Referência para o local onde os pedidos serão armazenados
      const pedidosRef = ref(db, 'DadosBelaVista/DadosGerais/Manutencoes');
      
      // Cria uma nova referência com ID único para este pedido
      const novoPedidoRef = push(pedidosRef);
      
      // Salva os dados no Firebase
      await set(novoPedidoRef, novoPedido);

      Alert.alert('Sucesso', 'Pedido de manutenção enviado com sucesso!');
      setTitulo('');
      setDescricao('');
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao enviar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar e voltar
  const handleCancelar = () => {
    setTitulo('');
    setDescricao('');
    navigation.goBack();
  };

  // Renderização do componente
  return (
    <GradientLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Pedido de Manutenção</Text>
          <Text style={styles.subtitle}>Preencha os detalhes do pedido</Text>
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.dadosUsuario}>Nome: {nomeMorador}</Text>
          <Text style={styles.dadosUsuario}>AP: {apartamentoUsuario}</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="Título do problema*"
            value={titulo}
            onChangeText={setTitulo}
            leftIcon={<Icon name="tools" type="font-awesome-5" size={20} color="#f5f5f5" />}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputText}
            placeholderTextColor="rgba(245,245,245,0.7)"
          />

          <Input
            placeholder="Descrição detalhada*"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={5}
            leftIcon={<Icon name="file-alt" type="font-awesome-5" size={18} color="#f5f5f5" />}
            inputContainerStyle={[styles.inputContainer, { height: Math.max(100, inputHeight) }]}
            inputStyle={[styles.inputText, { 
              height: Math.max(90, inputHeight - 10), 
              textAlignVertical: 'top' 
            }]}
            placeholderTextColor="rgba(245,245,245,0.7)"
            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Cancelar"
              type="outline"
              buttonStyle={styles.cancelButton}
              titleStyle={styles.cancelButtonText}
              onPress={handleCancelar}
              icon={{ name: "times-circle", type: "font-awesome", size: 16, color: "#F39C12" }}
              iconLeft
              containerStyle={styles.buttonWrapper}
              disabled={loading}
            />

            <Button
              title={loading ? "Enviando..." : "Enviar Pedido"}
              buttonStyle={styles.submitButton}
              titleStyle={styles.submitButtonText}
              onPress={salvarPedido}
              disabled={loading}
              loading={loading}
              icon={{ name: "check-circle", type: "font-awesome", size: 16, color: "white" }}
              iconRight
              containerStyle={styles.buttonWrapper}
            />
          </View>
        </View>
      </View>
    </GradientLayout>
  );
};

// Estilos (mantidos iguais)
const styles = {
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(245,245,245,0.8)',
    textAlign: 'center'
  },
  formContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: "96%",
    marginHorizontal: "2%",
    paddingVertical: 20,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: "90%",
    marginHorizontal: "5%",
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginBottom: 12
  },
  dadosUsuario: {
    fontSize: 14,
    color: 'rgba(245,245,245,0.8)',
    fontWeight: '600'
  },
  inputText: {
    color: '#f5f5f5',
    fontSize: 16
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  buttonWrapper: {
    width: '48%',
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F39C12",
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#F39C12",
    fontWeight: "bold",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    paddingVertical: 12,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
};

export default ManutencaoForm;