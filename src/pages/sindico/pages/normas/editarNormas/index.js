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
import { Input, Icon, Card } from '@rneui/themed';
import { db } from '../../../../../database/firebaseConfig';
import { ref, update } from 'firebase/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { formatDateOnly } from '../../../../../Utils/hourBrazil';

function EditarNorma() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  // Estados do formulário - inicializando diretamente com os params
  const [titulo, setTitulo] = useState(params.titulo || '');
  const [descricao, setDescricao] = useState(params.descricao || '');
  const [sindico, setSindico] = useState(params.sindico || '');
  const [loading, setLoading] = useState(false);
  const [dataPublicacao] = useState(params.dataPublicacao || '');


  const handleSalvar = async () => {
    if (!titulo.trim() || !descricao.trim() || !sindico.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos antes de salvar.');
      return;
    }

    setLoading(true);
    try {
      const normaRef = ref(db, `DadosBelaVista/administracao/normas/${params.id}`);
      
      await update(normaRef, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        sindico: sindico.trim().toUpperCase(),
        dataPublicacao:new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
      });

      Alert.alert('Sucesso', 'Norma atualizada com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a norma.');
      console.error("Erro ao atualizar norma:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para confirmar cancelamento
  const handleCancelar = () => {
    Alert.alert(
      'Cancelar Edição',
      'Tem certeza que deseja descartar as alterações?',
      [
        {
          text: 'Continuar Editando',
          style: 'cancel'
        },
        {
          text: 'Descartar',
          onPress: () => router.back(),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <GradientLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Card containerStyle={styles.card}>
            <View style={styles.header}>
              <Icon
                name="gavel"
                type="font-awesome"
                size={24}
                color="#f5f5f5"
              />
              <Text style={styles.title}>Editar Norma</Text>
            </View>

            {/* Input para Título */}
            <Input
              placeholder="Título da Norma"
              value={titulo}
              onChangeText={(text) => {
                console.log('Texto alterado:', text); // Para debug
                setTitulo(text);
              }}
              leftIcon={{
                type: 'material-community',
                name: 'format-title',
                color: '#f5f5f5'
              }}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              placeholderTextColor="#f5f5f5"
              maxLength={100}
            />

            {/* Input para Descrição */}
            <Input
              placeholder="Descrição Completa da Norma"
              value={descricao}
              onChangeText={(text) => {
                console.log('Descrição alterada:', text); // Para debug
                setDescricao(text);
              }}
              multiline
              numberOfLines={5}
              leftIcon={{
                type: 'material-community',
                name: 'text',
                color: '#f5f5f5'
              }}
              inputContainerStyle={[styles.inputContainer, { height: 150 }]}
              inputStyle={[styles.inputText, { height: 140, textAlignVertical: 'top' }]}
              placeholderTextColor="#f5f5f5"
              maxLength={2000}
            />

            {/* Input para Síndico */}
            <Input
              placeholder="Seu Nome como Síndico"
              value={sindico}
              onChangeText={(text) => {
                console.log('Síndico alterado:', text); // Para debug
                setSindico(text.toUpperCase());
              }}
              leftIcon={{
                type: 'material',
                name: 'person',
                color: '#f5f5f5'
              }}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputText}
              placeholderTextColor="#f5f5f5"
              autoCapitalize="characters"
              maxLength={50}
            />

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Icon name="calendar" type="font-awesome" size={16} color="#f5f5f5" />
                <Text style={styles.infoText}>
                  Data de publicação: {formatDateOnly(dataPublicacao)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="info-circle" type="font-awesome" size={16} color="#f5f5f5" />
                <Text style={styles.infoText}>
                  Última edição: {formatDateOnly(new Date().toISOString())}
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Pressable 
                style={styles.cancelButton}
                onPress={handleCancelar}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            
              <Pressable
                onPress={handleSalvar}
                disabled={loading || !titulo.trim() || !descricao.trim() || !sindico.trim()}
                style={[styles.submitButton, (loading || !titulo.trim() || !descricao.trim() || !sindico.trim()) && styles.disabledButton]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Atualizar</Text>
                )}
              </Pressable>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientLayout>
  );
}

// ... (mantenha os estilos exatamente como estão no seu código original)


const styles = {
  scrollContainer: {
    flexGrow: 1,
    // paddingVertical: 20,
  },
  card: {
    borderRadius: 7,
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
    marginBottom: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#f5f5f5',
    marginLeft: 10
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    // marginVertical: 8,
    height: 50,
    width: '100%'
  },
  inputText: {
    color: '#f5f5f5',
    fontSize: 15,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    borderWidth: 0,
    justifyContent: 'center',
    with: '96%',
    marginHorizontal: '2%'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 12,
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
    backgroundColor: "#F39C12",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: '45%',
  },
  cancelButtonText: {
    color: "#f9f9f9",
    fontWeight: "bold",
    fontSize: 14
  },
  submitButton: {
    backgroundColor: "#0F98A1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    width: '45%',
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

export default EditarNorma;