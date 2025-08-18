import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Input, Button, Icon } from '@rneui/themed';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { getDatabase, ref, push,get } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {formatDateWithTime} from '../../../../../../src/Utils/hourBrazil';
const ProtocoloDocumentos = () => {
  const [tipoOperacao, setTipoOperacao] = useState('entrada');
  const [departamento, setDepartamento] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [documento, setDocumento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [porteiro, setPorteiro] = useState('');
  const [nomePorteiro, setNomePorteiro] = useState("");

  // Busca o porteiro logado
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

  const handleSubmit = async () => {
    if (!departamento || !responsavel) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const db = getDatabase();
      const protocolosRef = ref(db, 'DadosBelaVista/administracao/protocolos');
      
      const novoProtocolo = {
        tipo: tipoOperacao,
        departamento,
        responsavel,
        documento: documento || 'Não informado',
        nomePorteiro,
        data:  new Date().toISOString(),
      };

      await push(protocolosRef, novoProtocolo);
      
      Alert.alert('✅ Sucesso!', `Protocolo de ${tipoOperacao === 'entrada' ? 'entrada' : 'saída'} registrado!`);
      
      // Limpa os campos
      setDepartamento('');
      setResponsavel('');
      setDocumento('');
    } catch (error) {
      console.error('Erro ao salvar protocolo:', error);
      Alert.alert('❌ Erro', 'Não foi possível registrar o protocolo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Icon 
            name="file-document-multiple" 
            type="material-community" 
            size={30} 
            color="#FFF"
          />
          <Text style={styles.title}>Protocolo de Documentos</Text>
          {porteiro && <Text style={styles.porteiroText}>Porteiro: {nomePorteiro}</Text>}
        </View>

        <View style={styles.formContainer}>
          {/* Seletor de Tipo */}
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[
                styles.tipoButton,
                tipoOperacao === 'entrada' && styles.tipoButtonActive
              ]}
              onPress={() => setTipoOperacao('entrada')}
            >
              <Icon
                name="file-import"
                type="material-community"
                size={20}
                color={tipoOperacao === 'entrada' ? '#FFF' : '#0F98A1'}
              />
              <Text style={[
                styles.tipoButtonText,
                tipoOperacao === 'entrada' && styles.tipoButtonTextActive
              ]}>
                Entrada
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tipoButton,
                tipoOperacao === 'saida' && styles.tipoButtonActive
              ]}
              onPress={() => setTipoOperacao('saida')}
            >
              <Icon
                name="file-export"
                type="material-community"
                size={20}
                color={tipoOperacao === 'saida' ? '#FFF' : '#e74c3c'}
              />
              <Text style={[
                styles.tipoButtonText,
                tipoOperacao === 'saida' && styles.tipoButtonTextActive
              ]}>
                Saída
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campos do Formulário */}
          <Input
            placeholder="Departamento*"
            value={departamento}
            onChangeText={setDepartamento}
            leftIcon={
              <Icon 
                name="office-building" 
                type="material-community" 
                size={20} 
                color="#7f8c8d" 
              />
            }
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputInnerContainer}
            inputStyle={styles.inputText}
          />

          <Input
            placeholder={tipoOperacao === 'entrada' ? "Recebido por*" : "Entregue para*"}
            value={responsavel}
            onChangeText={setResponsavel}
            leftIcon={
              <Icon 
                name="account" 
                type="material-community" 
                size={20} 
                color="#7f8c8d" 
              />
            }
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputInnerContainer}
            inputStyle={styles.inputText}
          />

          <Input
            placeholder="Número do documento (opcional)"
            value={documento}
            onChangeText={setDocumento}
            leftIcon={
              <Icon 
                name="file-document" 
                type="material-community" 
                size={20} 
                color="#7f8c8d" 
              />
            }
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputInnerContainer}
            inputStyle={styles.inputText}
          />

          <Button
            title={isLoading ? "Salvando..." : "Salvar Protocolo"}
            buttonStyle={styles.submitButton}
            titleStyle={styles.submitButtonText}
            onPress={handleSubmit}
            disabled={isLoading}
            icon={
              isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon
                  name="check-circle"
                  type="material-community"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
              )
            }
            iconRight
          />
        </View>
      </ScrollView>
    </GradientLayout>
  );
};

// Estilos (manter os mesmos do exemplo anterior)
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  porteiroText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
  },
  tipoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tipoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 5,
  },
  tipoButtonActive: {
    backgroundColor: '#0F98A1',
  },
  tipoButtonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tipoButtonTextActive: {
    fontWeight: 'bold',
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  inputInnerContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputText: {
    color: '#2c3e50',
    fontSize: 15,
    paddingLeft: 8,
  },
  submitButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default ProtocoloDocumentos;