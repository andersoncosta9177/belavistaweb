import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Alert 
} from 'react-native';
import { 
  Input, 
  Text, 
  Icon, 
  Card 
} from '@rneui/base';
import { useRouter } from 'expo-router';
import { db } from '../../../../../database/firebaseConfig';
import { ref, push, serverTimestamp, get } from 'firebase/database';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OcorrenciaMorador = () => {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [ocorrencia, setOcorrencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [porteiroNome, setPorteiroNome] = useState('Carregando...');
  const [porteiroCodigo, setPorteiroCodigo] = useState('');
  const [errors, setErrors] = useState({
    titulo: '',
    ocorrencia: ''
  });
  // useEffect(() => {
  //   const fetchCodigo = async () => {
  //     try {
  //       const codigo = await AsyncStorage.getItem('codigo');
  //       if (codigo) {
  //         router.push({
  //           pathname: '/src/pages/portaria/home',
  //           params: { codigo: codigo },
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Erro ao buscar o código:', error);
  //     }
  //   };

  //   fetchCodigo();
  // }, []);


  useEffect(() => {
    const fetchPorteiroData = async () => {
      try {
        // Busca o código do porteiro do AsyncStorage
        const codigo = await AsyncStorage.getItem('codigo');
        if (codigo) {
          setPorteiroCodigo(codigo);
          
          // Busca o nome do porteiro no Firebase
          const porteiroRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}`);
          const snapshot = await get(porteiroRef);
          
          if (snapshot.exists()) {
            const porteiroData = snapshot.val();
            setPorteiroNome(porteiroData.nome || 'Porteiro não identificado');
          } else {
            setPorteiroNome('Porteiro não encontrado');
          }
        } else {
          setPorteiroNome('Não logado');
        }
      } catch (error) {
        console.error('Erro ao obter dados do porteiro:', error);
        setPorteiroNome('Erro ao carregar');
      }
    };

    fetchPorteiroData();
  }, []);

  const handleSubmit = async () => {
    let formValid = true;
    const newErrors = { titulo: '', ocorrencia: '' };

    if (!titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
      formValid = false;
    }

    if (!ocorrencia.trim()) {
      newErrors.ocorrencia = 'Descrição da ocorrência é obrigatória';
      formValid = false;
    }

    setErrors(newErrors);

    if (!formValid) return;

    setLoading(true);

    try {
      const ocorrenciasRef = ref(db, 'DadosBelaVista/DadosPortaria/ocorrencias');
      
      const novaOcorrencia = {
        titulo: titulo.trim(),
        descricao: ocorrencia.trim(),
        dataRegistro: serverTimestamp(),
        porteiro: porteiroNome,
        status: 'Pendente',
      };

      await push(ocorrenciasRef, novaOcorrencia);

      Alert.alert('Sucesso', 'Ocorrência registrada com sucesso!');

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar a ocorrência. Tente novamente.');
      console.error('Erro ao salvar ocorrência:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientLayout>
      <View style={styles.container}>
        <Card containerStyle={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Ocorrência</Text>
            <Text style={styles.porteiroText}>Porteiro: {porteiroNome}</Text>
          </View>

          <Input
            placeholder="Título da ocorrência*"
            value={titulo}
            onChangeText={(text) => {
              setTitulo(text);
              setErrors({...errors, titulo: ''});
            }}
            inputStyle={styles.inputText}
            inputContainerStyle={[
              styles.inputContainer,
              errors.titulo ? styles.inputError : null
            ]}
            placeholderTextColor="rgba(255,255,255,0.7)"
            errorMessage={errors.titulo}
            errorStyle={styles.errorText}
            leftIcon={
              <Icon
                name="format-title"
                type="material-community"
                size={20}
                color="#FFF"
              />
            }
          />

          <Input
            placeholder="Descreva detalhadamente a ocorrência*"
            value={ocorrencia}
            onChangeText={(text) => {
              setOcorrencia(text);
              setErrors({...errors, ocorrencia: ''});
            }}
            multiline
            numberOfLines={5}
            inputStyle={[styles.inputText, styles.multilineInput]}
            inputContainerStyle={[
              styles.inputContainer,
              errors.ocorrencia ? styles.inputError : null
            ]}
            placeholderTextColor="rgba(255,255,255,0.7)"
            errorMessage={errors.ocorrencia}
            errorStyle={styles.errorText}
            leftIcon={
              <Icon
                name="alert-circle-outline"
                type="material-community"
                size={20}
                color="#FFF"
              />
            }
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Registrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
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
    paddingVertical: 20
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  porteiroText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  inputText: {
    color: '#FFF',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 5,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F39C12',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    width: '48%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#F39C12',
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default OcorrenciaMorador;