import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text, Icon, Card } from '@rneui/base';
import { db } from '../../../../../database/firebaseConfig'; // Ajuste o caminho conforme sua estrutura
import { ref, push } from 'firebase/database';
import GradientLayout from '../../../../../../src/Utils/gradiente';

const CadastroItemPerdido = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastrar = async () => {
    if (!titulo || !descricao) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      // Referência para o nó objetosPerdidos
      const objetosPerdidosRef = ref(db, 'DadosBelaVista/DadosGerais/objetosPerdidos');
      
      // Criar um novo objeto com os dados
      const novoObjeto = {
        titulo,
        descricao,
        dataCadastro: new Date().toISOString(),
        status: 'pendente' // Você pode adicionar outros campos padrão
      };

      // Salvar no Firebase
      await push(objetosPerdidosRef, novoObjeto);
      
      // Limpar o formulário após o cadastro
      setTitulo('');
      setDescricao('');
      
      Alert.alert('Sucesso', 'Item cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar item:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o item. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientLayout>
      <View style={styles.content}>
        <Text  style={styles.title}>Cadastrar Item Perdido</Text>
        
        <Card containerStyle={styles.card}>
          {/* Campo de Título */}
          <Input
            placeholder="Título do item"
            value={titulo}
            onChangeText={setTitulo}
            leftIcon={<Icon name="tag" type="material-community" size={24} color="#f9f9f9" />}
            inputStyle={styles.inputText}
            placeholderTextColor="#f9f9f9"
            inputContainerStyle={styles.inputContainer}
          />

          {/* Campo de Descrição */}
          <Input
            placeholder="Descrição detalhada"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
            leftIcon={<Icon name="text" type="material-community" size={24} color="#f9f9f9" />}
            inputStyle={[styles.inputText, styles.descInput]}
            placeholderTextColor="#f9f9f9"
            inputContainerStyle={[styles.inputContainer, styles.descContainer]}
          />

          {/* Botão de Cadastro */}
          <Button
            title="Cadastrar Item"
            onPress={handleCadastrar}
            loading={isLoading}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            containerStyle={styles.buttonContainer}
            disabled={!titulo || !descricao}
          />
        </Card>
      </View>
    </GradientLayout>
  );
};

// Os estilos permanecem os mesmos do código anterior
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 20
  },
  card: {
     margin: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    width: "96%",
    marginHorizontal: "2%",
    marginBottom: 10,
    borderRadius: 12,
    paddingVertical: 7
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#800080',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputText: {
    color: '#f9f9f9',
  },
  descInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  descContainer: {
    alignItems: 'flex-start',
  },
  button: {
       backgroundColor: "#0F98A1",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 10,
  },
});

export default CadastroItemPerdido;