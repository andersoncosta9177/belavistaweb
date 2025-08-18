import React, { useState } from 'react';
import { View, Modal, StyleSheet, Alert } from 'react-native';
import {
  Text,
  Input,
  Button,
  Icon,
  Card,
  Divider,
  Avatar
} from '@rneui/base';
import { useRouter } from 'expo-router';
import { ref, push, set } from 'firebase/database'; // Métodos do Realtime Database
import { db } from '../../../../../database/firebaseConfig';
import GradientLayout from '../../../../../../src/Utils/gradiente';
import { formatDateWithTime } from '../../../../../Utils/hourBrazil';

const alertasPredefinidos = [
  'Elevador de serviço em manutenção',
  'Manutenção do elevador de serviço finalizado',
  'Elevador social em manutenção',
  'Manutenção do elevador social finalizado',
  'Portão da garagem em manutenção',
  'Manutenção do portão da garagem finalizado',
  'Faturas de energia disponíveis',
  'Faturas de água disponíveis',
  'Faturas de gás disponíveis',
  'Boletos do condomínio disponíveis',
];

function Alertas() {
  const [alertaSelecionado, setAlertaSelecionado] = useState('');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  // **FUNÇÃO PARA SALVAR NO REALTIME DATABASE**
  const salvarAlertaNoFirebase = async (mensagem) => {
    try {
      // Cria uma referência para o caminho desejado
      const alertasRef = ref(db, 'DadosBelaVista/DadosPortaria/Alertas');
      
      // Gera um novo ID automático e salva os dados
      const novoAlertaRef = push(alertasRef);
      
      await set(novoAlertaRef, {
        mensagem: mensagem,
        dataEnvio:  new Date().toISOString(),
        tipo: mensagemPersonalizada ? 'personalizado' : 'predefinido',
      });

      Alert.alert('✅ Sucesso!', 'Alerta salvo com sucesso!');
      setMensagemPersonalizada('');
      setAlertaSelecionado('');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('❌ Erro', 'Não foi possível salvar o alerta.');
    }
  };

  // **FUNÇÃO PRINCIPAL DE ENVIO**
  const enviarAlerta = () => {
    const alerta = mensagemPersonalizada || alertaSelecionado;

    if (!alerta) {
      Alert.alert('⚠️ Atenção', 'Por favor, selecione ou escreva um alerta.');
      return;
    }

    salvarAlertaNoFirebase(alerta);
  };

  return (
    <GradientLayout style={styles.container}>
      <View style={styles.header}>
        <Avatar
          size={40}
          rounded
          icon={{ name: "alert", type: "material-community", color: "#fff" }}
          containerStyle={styles.avatar}
        />
        <Text style={styles.headerTitle}>Emitir Alerta</Text>
      </View>

      <Card containerStyle={styles.card}>
        <Input
          placeholder="Escreva um alerta"
          value={mensagemPersonalizada}
          onChangeText={setMensagemPersonalizada}
          leftIcon={<Icon name="message-text" type="material-community" size={20} color="#f9f9f9" />}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          placeholderTextColor={'#f9f9f9'}
        />

        <Button
          title={alertaSelecionado || "Alerta predefinido"}
          onPress={() => setModalVisible(true)}
          icon={<Icon name="format-list-bulleted" type="material-community" size={20} color="white" />}
          iconRight
          buttonStyle={styles.selectButton}
          titleStyle={styles.selectButtonText}
        />

        <Divider style={styles.divider} />

        <View style={styles.buttonRow}>
          <Button
            title="Cancelar"
            onPress={() => router.back()}
            buttonStyle={styles.cancelButton}
            containerStyle={styles.buttonContainer}
          />
          <Button
            title="Enviar Alerta"
            onPress={enviarAlerta}
            buttonStyle={styles.sendButton}
            containerStyle={styles.buttonContainer}
            icon={<Icon name="send" type="material-community" size={20} color="white" />}
            iconRight
          />
        </View>
      </Card>

      {/* Modal com alertas predefinidos */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Card containerStyle={styles.modalCard}>
            <Card.Title style={styles.modalTitle}>Alertas Predefinidos</Card.Title>
            <Card.Divider />
            
            {alertasPredefinidos.map((alerta, index) => (
              <Button
                key={index}
                title={alerta}
                type="clear"
                titleStyle={styles.alertaTexto}
                buttonStyle={styles.alertaItem}
                onPress={() => {
                  setAlertaSelecionado(alerta);
                  setModalVisible(false);
                }}
                icon={<Icon name="alert-circle" type="material-community" size={20} color="#FF5252" />}
                iconRight
              />
            ))}

            <Button
              title="Fechar"
              onPress={() => setModalVisible(false)}
              buttonStyle={styles.modalCloseButton}
              containerStyle={styles.modalButtonContainer}
            />
          </Card>
        </View>
      </Modal>
    </GradientLayout>
  );
}

// **ESTILOS (mantidos os mesmos)**
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    justifyContent: 'center'
  },
  avatar: {
    backgroundColor: '#FF5252',
    marginRight: 15,
  },
  headerTitle: {
    color: '#f5f5f5',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  card: {
    borderRadius: 10,
    marginHorizontal: '2%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    with: '96%',
    padding: 12,
    overflow: 'hidden',
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: '98%',
    marginTop: 10,
  },
  inputText: {
    color: '#f9f9f9',
    fontSize: 16,
  },
  selectButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
    color: '#f9f9f9',
  },
  divider: {
    marginVertical: 25,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#F39C12',
    borderRadius: 10,
    paddingVertical: 12,
  },
  sendButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 10,
    paddingVertical: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    borderRadius: 15,
    padding: 15,
    maxHeight: '80%',
    backgroundColor: '#8e5e30',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f9f9f9',
    textAlign: 'left',
  },
  alertaItem: {
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  alertaTexto: {
    fontSize: 14,
    color: '#f9f9f9',
    textAlign: 'left',
    flex: 1,
    marginLeft: 10,
  },
  modalCloseButton: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    marginTop: 15,
    paddingVertical: 12,
  },
  modalButtonContainer: {
    marginHorizontal: 0,
  },
});

export default Alertas;