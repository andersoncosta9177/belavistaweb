import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Icon, Input, CheckBox, Button } from '@rneui/themed';
import GradientLayout from '../../../../../Utils/gradiente';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import {useRouter} from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { ThemeProvider } from '../../../../../context/ThemeContext';

const TermoResponsabilidade = () => {
   const params = useLocalSearchParams();
  const { id } = params; // Recebe apenas o ID do evento
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [expanded, setExpanded] = useState(true);
  const [nome, setNome] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [cpf, setCpf] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [canSubmit, setCanSubmit] = useState(false);

  const router = useRouter();

  // Carrega os dados do usuário ao montar o componente
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setNome(userData.nome || '');
          setApartamento(userData.apartamento || '');
        }
      }
    };

    loadUserData();
  }, [currentUser]);

  // Contador de 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= 30) {
          setCanSubmit(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert(
        'Aguarde',
        `Você precisa ler os termos por pelo menos 30 segundos antes de enviar. Faltam ${30 - timeElapsed} segundos.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!acceptTerms) {
      Alert.alert('Atenção', 'Você precisa aceitar os termos para continuar');
      return;
    }

    if (!cpf) {
      Alert.alert('Atenção', 'Por favor, informe seu CPF');
      return;
    }

    try {
      const termoRef = ref(
        db, 
        `DadosBelaVista/DadosGerais/Reservas/${id}/termosDeResponsabilidade`
      );

      const declaracao = `Eu, ${nome}, morador do apartamento ${apartamento}, declaro estar ciente e de acordo com os termos estabelecidos e comprometo-me a cumpri-los integralmente.`;

      await set(termoRef, {
        declaracao,
        cpf,
        data: date.toLocaleDateString('pt-BR'),
        horario: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        dataEnvio: new Date().toISOString(),
        nome,
        apartamento
      });

      Alert.alert('Sucesso', 'Termo enviado com sucesso!');
      // Limpa apenas o CPF após o envio
      setCpf('');
      setAcceptTerms(false);
      setTimeElapsed(0);
      setCanSubmit(false);
      router.back();
    } catch (error) {
      console.error('Erro ao salvar termo:', error);
      Alert.alert('Erro', 'Não foi possível enviar o termo. Tente novamente.');
    }
  };

  return (
   <ThemeProvider>
     <GradientLayout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card containerStyle={styles.headerCard}>
          <View style={styles.headerContent}>
            <Icon name="file-document" type="material-community" size={30} color="#f9f9f9" />
            <Text style={styles.headerTitle}>Termo de Responsabilidade</Text>
          </View>
        </Card>

        <Card containerStyle={styles.accordionCard}>
          <TouchableOpacity 
            style={styles.accordionHeader} 
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.accordionTitle}>Termo de responsabilidade </Text>
            <Icon 
              name={expanded ? "chevron-up" : "chevron-down"} 
              type="material-community" 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>

          {expanded && (
            <View style={styles.accordionBody}>
              <Text style={styles.paragraph}>
                Na qualidade de morador residente no <Text style={styles.bold}>Condomínio Residencial Bela Vista</Text>, 
                situado no endereço acima citado, venho pelo presente termo solicitar reserva da área de lazer para dia 
                e horário acima indicados, responsabilizando-me integralmente pela conservação do espaço e qualquer dano 
                causado ao patrimônio do condomínio e também a acatar as orientações e cumprimento das normas abaixo:
              </Text>

              {[
                "Reservar com 48 horas de antecedência.",
                "A reserva será registrada com a taxa correspondente, que será incluída no boleto do mês seguinte:\n\nAté 15 pessoas: R$ 30,00\nDe 31 a 50 pessoas: R$ 50,00\nAcima de 51 pessoas: R$ 70,00",
                "Reserva mediante assinatura do termo de responsabilidade e vistoria prévia.",
                "Público máximo permitido até 100 pessoas.",
                "Duração máxima de 08h ininterruptas independente do dia e horário de início.",
                "Horário de utilização entre 08h e 20h aos domingos; 08h e 22h de segunda a quinta-feira e 08h e 23h as sextas e sábados.",
                "Uso de som em volume moderado, conforme previsto em lei.",
                "Utilização de som mecânico ou ao vivo apenas após 08 horas da manhã, independente do dia.",
                "Não é permitido fazer frituras dentro do salão de festas.",
                "Não é permitido sublocação.",
                "Não é permitido som automotivo.",
                "Não é permitido colocar enfeites e adereços que danifiquem paredes, vidros, teto etc.",
                "Liberação e permissão de 60 minutos (uma hora) antes e 30 minutos (meia hora) após o evento para organização, arrumação sem descontar dos 8 horas liberadas.",
                "Playground e quadra de esportes liberados para uso comum, mesmo havendo reserva.",
                "Desistências e cancelamentos deverão ser comunicados 72 antes da data do evento.",
                "Se utilizar toalhas do condomínio deverão ser devolvidas limpas e passadas.",
                "A entrada de convidados se dará apenas pela portaria do condomínio.",
                "É necessário apresentar lista de convidados para controle da portaria.",
                "Devolver o salão de festas e churrasqueira nas condições recebidas, assumindo qualquer dano ocasionado á mobília, decoração, eletrodomésticos, aparelhos eletrônicos, som e home-theater e demais objetos presentes."
              ].map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <Icon name="circle-small" type="material-community" size={20} color="#0F98A1" />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}

              <Text style={[styles.paragraph, styles.mt3]}>
                Essas normas foram aprovadas em <Text style={styles.bold}>AGE</Text> realizadas anteriormente, e estão 
                registradas em ata. Em caso de não cumprimento por parte do morador penalidades e multas previstas na 
                Convenção poderão ser aplicadas.
              </Text>
            </View>
          )}
        </Card>

        <Card containerStyle={styles.formCard}>
          <Text style={styles.formTitle}>Formulário</Text>
          
          <Input
            placeholder="Nome completo"
            leftIcon={<Icon name="account" type="material-community" size={20} color="#9E9E9E" />}
            value={nome}
            onChangeText={setNome}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            placeholderTextColor={'#f9f9f9'}
            editable={false}
          />
          
          <Input
            placeholder="Apartamento"
            leftIcon={<Icon name="home" type="material-community" size={20} color="#9E9E9E" />}
            value={apartamento}
            onChangeText={setApartamento}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            placeholderTextColor={'#f9f9f9'}
            editable={false}
          />
          
          <Input
            placeholder="CPF"
            leftIcon={<Icon name="card-account-details" type="material-community" size={20} color="#9E9E9E" />}
            value={cpf}
            onChangeText={setCpf}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
            keyboardType="numeric"
            placeholderTextColor={'#f9f9f9'}
          />

          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" type="material-community" size={20} color="#f9f9f9" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="clock" type="material-community" size={20} color="#f9f9f9" />
            <Text style={styles.dateText}>
              Horário de início: {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onChangeTime}
            />
          )}

          <CheckBox
            title={`Li e concordo com os termos de responsabilidade acima (${timeElapsed}/30s)`}
            checked={acceptTerms}
            onPress={() => setAcceptTerms(!acceptTerms)}
            disabled={timeElapsed < 30}
            checkedIcon={
              <Icon name="checkbox-marked" type="material-community" color="#4CAF50" size={28} />
            }
            uncheckedIcon={
              <Icon name="checkbox-blank-outline" type="material-community" color="#f9f9f9" size={28} />
            }
            containerStyle={styles.checkboxContainer}
            textStyle={styles.checkboxText}
          />

          <Button
            title={canSubmit ? "Enviar" : `Aguarde (${30 - timeElapsed}s)`}
            buttonStyle={styles.submitButton}
            onPress={handleSubmit}
            disabled={!canSubmit || !acceptTerms}
            icon={
              <Icon
                name="send"
                type="material-community"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
            }
          />
        </Card>
      </ScrollView>
    </GradientLayout>
   </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerCard: {
    borderRadius: 7,
    marginBottom: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#f9f9f9',
    marginLeft: 10,
  },
  accordionCard: {
    borderRadius: 1,
    marginBottom: 0,
    padding: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0,
    overflow: 'hidden',
    width: '94%',
    marginHorizontal: '3%',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#14afbaff',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  accordionBody: {
    padding: 15,
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
    lineHeight: 20,
  },
  mt3: {
    marginTop: 15,
  },
  formCard: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 0,
    width: '94%',
    marginHorizontal: '3%',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'semibold',
    color: '#f9f9f9',
    textAlign: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#f9f9f9',
    paddingHorizontal: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#f9f9f9',
    marginLeft: 10,
  },
  checkboxContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 15,
    padding: 0,
  },
  checkboxText: {
    fontSize: 12,
    color: '#f9f9f9',
    fontWeight: 'normal',
  },
  submitButton: {
    backgroundColor: '#0F98A1',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default TermoResponsabilidade;