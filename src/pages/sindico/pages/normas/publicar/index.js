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
import { ref, push, set } from 'firebase/database';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatDateOnly, getCurrentDateForDisplay } from '../../../../../Utils/hourBrazil'

function PublicarNormas() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [sindico, setSindico] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [normaId, setNormaId] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Verifica se está em modo de edição ao carregar o componente
  useEffect(() => {
    if (params.id) {
      setIsEditing(true);
      setNormaId(params.id);
      setTitulo(params.titulo || '');
      setDescricao(params.descricao || '');
      setSindico(params.sindico || '');
    }
  }, [params]);

const handlePublicar = async () => {
  if (!titulo.trim() || !descricao.trim() || !sindico.trim()) {
    Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
    return;
  }

  setLoading(true);
  try {
    const normaData = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      sindico: sindico.trim().toUpperCase(),
      dataPublicacao: isEditing ? params.dataPublicacao : new Date().toISOString(),
      dataExibicao: getCurrentDateForDisplay()
    };

    if (isEditing) {
      await set(ref(db, `DadosBelaVista/administracao/normas/${normaId}`), normaData);
      Alert.alert('Sucesso', 'Norma atualizada com sucesso!');
    } else {
      await push(ref(db, 'DadosBelaVista/administracao/normas'), normaData);
      Alert.alert('Sucesso', 'Norma publicada com sucesso!');
    }

    // Limpa os estados independente do modo
    setTitulo('');
    setDescricao('');
    setSindico('');
    setIsEditing(false);
    setNormaId(null);

    router.push('/src/pages/sindico/pages/normas/normasPublicadas');
  } catch (error) {
    console.error(`Erro ao ${isEditing ? 'atualizar' : 'publicar'} norma:`, error);
    Alert.alert('Erro', `Não foi possível ${isEditing ? 'atualizar' : 'publicar'} a norma`);
  } finally {
    setLoading(false);
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
                name="gavel"
                type="font-awesome"
                size={24}
                color="#f5f5f5"
              />
              <Text style={styles.title}>
                {isEditing ? 'Editar Norma' : 'Publicar Norma'}
              </Text>
            </View>

            <Input
              placeholder="Título"
              value={titulo}
              onChangeText={setTitulo}
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

            <Input
              placeholder="Descrição das normas do condomínio"
              value={descricao}
              onChangeText={setDescricao}
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

            <Input
              placeholder=" Nome do Síndico"
              value={sindico}
              onChangeText={(text) => setSindico(text.toUpperCase())}
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
      {isEditing ? 'Publicação original: ' : 'Data de publicação: '} 
      {isEditing ? 
        (params.dataPublicacao ? formatDateOnly(params.dataPublicacao) : 'Não disponível') : 
        getCurrentDateForDisplay()}
    </Text>
  </View>
  {isEditing && (
    <View style={styles.infoRow}>
      <Icon name="history" type="font-awesome" size={16} color="#f5f5f5" />
      <Text style={styles.infoText}>
        Última atualização: {getCurrentDateForDisplay()}
      </Text>
    </View>
  )}
</View>

            <View style={styles.buttonRow}>
              <Pressable 
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            
              <Pressable
                onPress={handlePublicar}
                disabled={loading || !titulo.trim() || !descricao.trim() || !sindico.trim()}
                style={[styles.submitButton, (loading || !titulo.trim() || !descricao.trim() || !sindico.trim()) && styles.disabledButton]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Atualizar' : 'Publicar'}
                  </Text>
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
    marginBottom: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#f5f5f5',
    textAlign: 'center',
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 7,
    paddingHorizontal: 10,
    width: '100%'
  },
  inputText: {
    color: '#f5f5f5',
    fontSize: 15,
  },
  infoContainer: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    with: '96%',
    overflow: 'hidden',
    marginHorizontal: '2%'
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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

export default PublicarNormas;