import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { Input, Button, Icon } from '@rneui/themed';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';

// Firebase imports
import { db } from '../../../../../database/firebaseConfig';
import { ref, push, get } from 'firebase/database';

const FormularioVisitante = () => {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('CPF');
  const [dataVisita, setDataVisita] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
  const [observacoes, setObservacoes] = useState('');
  const [userData, setUserData] = useState(null);

  // Obter dados do usuário logado
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      }).catch((error) => {
        console.error('Erro ao buscar dados do usuário:', error);
      });
    }
  }, []);

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    Alert.alert("Erro", "Nenhum usuário logado!");
    return;
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = () => {
    if (!nome || !documento) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const visitanteData = {
      nome,
      documento: `${tipoDocumento}: ${documento}`,
      data: dataVisita.toLocaleDateString('pt-BR'),
      horario: dataVisita.toLocaleTimeString('pt-BR', {
        hour: '2-digit', 
        minute: '2-digit'
      }),
      timestamp: dataVisita.toISOString(),
      observacoes,
      morador: {
        nome: userData?.nome || "Não identificado",
        apartamento: userData?.apartamento || "Não informado",
        uid: user.uid
      },
      autorizado: false,
      autorizadoPor: null,
      autorizadoEm: null,
      emVisita: false
    };

    const visitantesRef = ref(db, 'DadosBelaVista/DadosMoradores/visitantes');
    push(visitantesRef, visitanteData)
      .then(() => {
        Alert.alert('Sucesso', 'Solicitação de visita registrada com sucesso!');
        // Limpar campos
        setNome('');
        setDocumento('');
        setDataVisita(new Date());
        setObservacoes('');
      })
      .catch((error) => {
        console.error('Erro ao salvar visitante:', error);
        Alert.alert('Erro', 'Não foi possível registrar a visita.');
      });
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') return;
    }
    
    const currentDate = selectedDate || dataVisita;
    setDataVisita(currentDate);
    
    // No iOS, depois de selecionar a data, mostramos o time picker
    if (Platform.OS === 'ios' || pickerMode === 'date') {
      if (Platform.OS === 'android') {
        setPickerMode('time');
        setShowDatePicker(true);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const showPicker = (mode) => {
    setPickerMode(mode);
    setShowDatePicker(true);
  };

  return (
    <GradientLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Autorizar Visitante</Text>
          <Text style={styles.subtitle}>Preencha os dados do visitante</Text>
          
          {userData && (
            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfoText}>Responsável: {userData.nome}</Text>
              <Text style={styles.userInfoText}>Apartamento: {userData.apartamento}</Text>
            </View>
          )}
        </View>

        <View style={styles.formContainer}>
          <Input
            placeholder="Nome completo do visitante*"
            value={nome}
            onChangeText={setNome}
            leftIcon={<Icon name="user" type="font-awesome" size={20} color="#7f8c8d" />}
            containerStyle={styles.inputContainer}
            inputContainerStyle={styles.inputInnerContainer}
            inputStyle={styles.inputText}
            placeholderTextColor="#95a5a6"
          />

          <View style={styles.documentoContainer}>
            <View style={styles.tipoDocumento}>
              <Button
                title="CPF"
                type={tipoDocumento === 'CPF' ? 'solid' : 'outline'}
                onPress={() => setTipoDocumento('CPF')}
                buttonStyle={[
                  styles.documentoButton,
                  tipoDocumento === 'CPF' ? styles.documentoButtonActive : styles.documentoButtonInactive
                ]}
                titleStyle={styles.documentoButtonText}
              />
              <View style={styles.buttonSpacer} />
              <Button
                title="RG"
                type={tipoDocumento === 'RG' ? 'solid' : 'outline'}
                onPress={() => setTipoDocumento('RG')}
                buttonStyle={[
                  styles.documentoButton,
                  tipoDocumento === 'RG' ? styles.documentoButtonActive : styles.documentoButtonInactive
                ]}
                titleStyle={styles.documentoButtonText}
              />
            </View>

            <Input
              placeholder={`Número do ${tipoDocumento}*`}
              value={documento}
              onChangeText={setDocumento}
              keyboardType="numeric"
              leftIcon={<Icon name="id-card" type="font-awesome-5" size={18} color="#7f8c8d" />}
              containerStyle={styles.inputContainer}
              inputContainerStyle={styles.inputInnerContainer}
              inputStyle={styles.inputText}
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => showPicker('date')}
            >
              <Icon name="calendar" type="font-awesome" size={18} color="#7f8c8d" style={styles.icon} />
              <Text style={styles.dateText}>{dataVisita.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.timeInput} 
              onPress={() => showPicker('time')}
            >
              <Icon name="clock-o" type="font-awesome" size={18} color="#7f8c8d" style={styles.icon} />
              <Text style={styles.dateText}>
                {dataVisita.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dataVisita}
              mode={pickerMode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDate}
              minimumDate={new Date()}
              is24Hour={true}
            />
          )}

          <Input
            placeholder="Observações (opcional)"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
            leftIcon={<Icon name="sticky-note" type="font-awesome-5" size={18} color="#7f8c8d" />}
            containerStyle={styles.inputContainer}
            inputContainerStyle={[styles.inputInnerContainer, { minHeight: 100 }]}
            inputStyle={[styles.inputText, { textAlignVertical: 'top' }]}
            placeholderTextColor="#95a5a6"
          />
        </View>

        <Button
          title="Solicitar Autorização"
          buttonStyle={styles.submitButton}
          titleStyle={styles.submitButtonText}
          containerStyle={styles.submitButtonContainer}
          onPress={handleSubmit}
          icon={
            <Icon
              name="check-circle"
              type="font-awesome"
              size={20}
              color="white"
              style={styles.buttonIcon}
            />
          }
          iconRight
        />
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  userInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  userInfoText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(61, 8, 8, 0.3)',
    borderRadius: 15,
    marginBottom: 20,
    paddingVertical: 20,
    width: '96%',
    marginHorizontal: '2%',
  },
  inputContainer: {
    marginBottom: 20,
    width: '96%',
    marginHorizontal: '2%',
  },
  inputInnerContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    width: '100%',
  },
  inputText: {
    color: '#34495e',
    fontSize: 16,
    width: '100%',
  },
  documentoContainer: {
    marginBottom: 10,
  },
  tipoDocumento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '90%',
    marginHorizontal: '5%',
  },
  documentoButton: {
    width: 120,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
  },
  documentoButtonActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  documentoButtonInactive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#7f8c8d',
  },
  documentoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  buttonSpacer: {
    width: 15,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginHorizontal: '5%',
    marginBottom: 20,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    width: '48%',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    width: '48%',
  },
  icon: {
    marginRight: 10
  },
  dateText: {
    color: '#34495e',
    fontSize: 16
  },
  submitButtonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '94%',
    marginHorizontal: '3%',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    height: 50,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  buttonIcon: {
    marginLeft: 10
  }
});

export default FormularioVisitante;