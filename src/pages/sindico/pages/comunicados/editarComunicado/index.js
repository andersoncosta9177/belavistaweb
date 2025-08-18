import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { db } from '../../../../../database/firebaseConfig';
import { ref, update } from 'firebase/database';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EditarComunicado = () => {
  const [inputHeight, setInputHeight] = useState(150);
  const [titulo, setTitulo] = useState("");
  const [comunicado, setComunicado] = useState("");
  const [nomeSindico, setNomeSindico] = useState("");
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.id) {
      setTitulo(params.titulo || "");
      setComunicado(params.comunicado || "");
      setNomeSindico(params.nomeSindico || "");
    }
  }, []);

  const handleEditarComunicado = () => {
    if (!titulo || !comunicado || !nomeSindico) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    const comunicadoRef = ref(db, `DadosBelaVista/administracao/comunicados/${params.id}`);

    update(comunicadoRef, {
      titulo,
      comunicado,
      nomeSindico,
      data: new Date().toISOString(),
    })
      .then(() => {
        Alert.alert("Sucesso", "Comunicado atualizado com sucesso!");
        router.push("/src/pages/sindico/pages/comunicados/publicados");
      })
      .catch((error) => {
        Alert.alert("Erro", "Ocorreu um erro ao atualizar o comunicado.");
        console.error(error);
      });
  };

  return (
    <GradientLayout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Editar Comunicado</Text>
            <Text style={styles.subtitle}>Atualize as informações necessárias</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons 
                name="format-title" 
                size={20} 
                color="#f5f5f5" 
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Título do comunicado"
                placeholderTextColor="rgba(245,245,245,0.7)"
              />
            </View>

            <View style={[styles.inputWrapper, styles.multilineWrapper]}>
              <MaterialCommunityIcons 
                name="text" 
                size={20} 
                color="#f5f5f5" 
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, styles.multilineInput, { height: Math.max(150, inputHeight) }]}
                value={comunicado}
                onChangeText={setComunicado}
                placeholder="Conteúdo do comunicado"
                placeholderTextColor="rgba(245,245,245,0.7)"
                multiline
                textAlignVertical="top"
                onContentSizeChange={e => {
                  setInputHeight(e.nativeEvent.contentSize.height);
                }}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons 
                name="account" 
                size={20} 
                color="#f5f5f5" 
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={nomeSindico}
                onChangeText={setNomeSindico}
                placeholder="Nome do síndico"
                placeholderTextColor="rgba(245,245,245,0.7)"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => router.push("/src/pages/sindico/pages/comunicados/comunicadosHome")}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleEditarComunicado}
            >
              <Text style={styles.submitButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
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
    marginBottom: 20
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,245,245,0.3)'
  },
  multilineWrapper: {
    alignItems: 'flex-start',
    paddingTop: 15
  },
  icon: {
    marginRight: 10,
    marginTop: 3
  },
  input: {
    flex: 1,
    color: '#f5f5f5',
    fontSize: 16,
    paddingVertical: 15,
  },
  multilineInput: {
    minHeight: 150,
    textAlignVertical: 'top'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelButton: {
    backgroundColor: '#F39C12',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  cancelButtonText: {
    color: '#f9f9f9',
    fontWeight: 'bold',
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default EditarComunicado;