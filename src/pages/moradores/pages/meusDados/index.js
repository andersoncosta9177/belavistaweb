import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Input, Button, Text, Icon, Avatar, Divider } from '@rneui/themed';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getDatabase, ref, update, onValue, off } from 'firebase/database';
import GradientLayout from '../../../../../src/Utils/gradiente';

const DadosMorador = () => {
  const [moradorData, setMoradorData] = useState({
    nome: '',
    email: '',
    apartamento: '',
    telefone: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const moradorRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
    
    const fetchData = () => {
      onValue(moradorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setMoradorData({
            nome: data.nome || '',
            email: data.email || user.email || '',
            apartamento: data.apartamento || '',
            telefone: data.telefone || ''
          });
        }
      });
    };

    fetchData();

    return () => {
      off(moradorRef);
    };
  }, [user]);

  const validateFields = () => {
    const newErrors = {};
    
    if (!moradorData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!moradorData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^\S+@\S+\.\S+$/.test(moradorData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!moradorData.apartamento.trim()) {
      newErrors.apartamento = 'Apartamento é obrigatório';
    }
    
    if (!moradorData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (moradorData.telefone.replace(/\D/g, '').length < 11) {
      newErrors.telefone = 'Telefone incompleto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSalvar = async () => {
    if (!validateFields()) return;
    
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsLoading(true);

    try {
      const updates = {
        [`DadosBelaVista/usuarios/usuarioMorador/${user.uid}/nome`]: moradorData.nome,
        [`DadosBelaVista/usuarios/usuarioMorador/${user.uid}/email`]: moradorData.email,
        [`DadosBelaVista/usuarios/usuarioMorador/${user.uid}/apartamento`]: moradorData.apartamento,
        [`DadosBelaVista/usuarios/usuarioMorador/${user.uid}/telefone`]: moradorData.telefone,
      };

      await update(ref(db), updates);
      
      Alert.alert('Sucesso', 'Seus dados foram atualizados com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      
      // Reautenticar o usuário
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Atualizar a senha
      await updatePassword(user, passwordData.newPassword);
      
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Erro', 'Senha atual incorreta');
      } else {
        Alert.alert('Erro', 'Não foi possível alterar a senha');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatarTelefone = (text) => {
    let telefone = text.replace(/\D/g, '');
    
    if (telefone.length > 10) {
      telefone = telefone.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    } else if (telefone.length > 6) {
      telefone = telefone.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (telefone.length > 2) {
      telefone = telefone.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
    } else {
      telefone = telefone.replace(/^(\d{0,2}).*/, '($1');
    }
    
    return telefone;
  };

  const handleTelefoneChange = (text) => {
    const formattedTelefone = formatarTelefone(text);
    setMoradorData({...moradorData, telefone: formattedTelefone});
  };

  return (
    <GradientLayout scrollEnabled={true}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Meu Perfil</Text>
          
          <View style={styles.card}>
            {/* Avatar do Morador */}
            <View style={styles.avatarContainer}>
              <Avatar
                size={120}
                rounded
                icon={{ name: 'user', type: 'font-awesome', color: 'white' }}
                containerStyle={styles.avatar}
                overlayContainerStyle={{ backgroundColor: '#822bb8ff' }}
              />
              <Text style={styles.userName}>{moradorData.nome || 'Morador'}</Text>
              <Text style={styles.userApartment}>{moradorData.apartamento || 'Apartamento'}</Text>
            </View>

            {/* Seção de Informações Pessoais */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
              <Divider style={styles.divider} />
              
              <Input
                label="Nome Completo"
                value={moradorData.nome}
                onChangeText={(text) => setMoradorData({ ...moradorData, nome: text })}
                disabled={!isEditing}
                errorMessage={errors.nome}
                inputStyle={styles.inputText}
                labelStyle={styles.label}
                inputContainerStyle={[styles.inputContainer, errors.nome && styles.inputError]}
                leftIcon={<Icon name="user" type="font-awesome" size={20} color="#43e6f1ff" />}
              />

              <Input
                label="Email"
                value={moradorData.email}
                onChangeText={(text) => setMoradorData({ ...moradorData, email: text })}
                disabled={!isEditing}
                keyboardType="email-address"
                errorMessage={errors.email}
                inputStyle={styles.inputText}
                labelStyle={styles.label}
                inputContainerStyle={[styles.inputContainer, errors.email && styles.inputError]}
                leftIcon={<Icon name="envelope" type="font-awesome" size={20} color="#43e6f1ff" />}
              />

              <Input
                label="Apartamento"
                value={moradorData.apartamento}
                onChangeText={(text) => setMoradorData({ ...moradorData, apartamento: text })}
                disabled={!isEditing}
                errorMessage={errors.apartamento}
                inputStyle={styles.inputText}
                labelStyle={styles.label}
                inputContainerStyle={[styles.inputContainer, errors.apartamento && styles.inputError]}
                leftIcon={<Icon name="home" type="font-awesome" size={20} color="#43e6f1ff" />}
              />

              <Input
                label="Telefone"
                value={moradorData.telefone}
                onChangeText={handleTelefoneChange}
                disabled={!isEditing}
                keyboardType="phone-pad"
                errorMessage={errors.telefone}
                inputStyle={styles.inputText}
                labelStyle={styles.label}
                inputContainerStyle={[styles.inputContainer, errors.telefone && styles.inputError]}
                placeholder="(00) 00000-0000"
                leftIcon={<Icon name="phone" type="font-awesome" size={20} color="#43e6f1ff" />}
              />
            </View>

            {/* Botões de Ação */}
            <View style={styles.buttonsContainer}>
              {!isEditing ? (
                <Button
                  title="Editar Perfil"
                  onPress={() => setIsEditing(true)}
                  buttonStyle={styles.editButton}
                  titleStyle={styles.buttonText}
                  icon={{
                    name: 'edit',
                    type: 'font-awesome',
                    size: 16,
                    color: 'white'
                  }}
                  iconRight
                />
              ) : (
                <>
                  <Button
                    title="Salvar Alterações"
                    onPress={handleSalvar}
                    loading={isLoading}
                    buttonStyle={styles.saveButton}
                    titleStyle={styles.buttonText}
                    icon={{
                      name: 'save',
                      type: 'font-awesome',
                      size: 16,
                      color: 'white'
                    }}
                    iconRight
                  />
                  <Button
                    title="Cancelar"
                    onPress={() => {
                      setIsEditing(false);
                      setErrors({});
                    }}
                    buttonStyle={styles.cancelButton}
                    titleStyle={styles.buttonText}
                    containerStyle={styles.secondaryButtonContainer}
                    icon={{
                      name: 'times',
                      type: 'font-awesome',
                      size: 16,
                      color: 'white'
                    }}
                    iconRight
                  />
                </>
              )}
            </View>

            {/* Seção de Alteração de Senha */}
            <View style={styles.section}>
              <TouchableOpacity 
                onPress={() => setShowPasswordForm(!showPasswordForm)}
                style={styles.passwordHeader}
              >
                <Text style={styles.sectionTitle}>Alterar Senha</Text>
                <Icon 
                  name={showPasswordForm ? 'chevron-up' : 'chevron-down'} 
                  type="font-awesome" 
                  color="#f1f1f1" 
                />
              </TouchableOpacity>
              
              {showPasswordForm && (
                <View>
                  <Divider style={styles.divider} />
                  
                  <Input
                    label="Senha Atual"
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, currentPassword: text})}
                    secureTextEntry
                    inputStyle={styles.inputText}
                    labelStyle={styles.label}
                    inputContainerStyle={styles.inputContainer}
                    leftIcon={<Icon name="lock" type="font-awesome" size={20} color="#f9f9f9" />}
                  />

                  <Input
                    label="Nova Senha"
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, newPassword: text})}
                    secureTextEntry
                    inputStyle={styles.inputText}
                    labelStyle={styles.label}
                    inputContainerStyle={styles.inputContainer}
                    leftIcon={<Icon name="key" type="font-awesome" size={20} color="#f9f9f9" />}
                  />

                  <Input
                    label="Confirmar Nova Senha"
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({...passwordData, confirmPassword: text})}
                    secureTextEntry
                    inputStyle={styles.inputText}
                    labelStyle={styles.label}
                    inputContainerStyle={styles.inputContainer}
                    leftIcon={<Icon name="key" type="font-awesome" size={20} color="#f9f9f9" />}
                  />

                  <Button
                    title="Alterar Senha"
                    onPress={handleChangePassword}
                    loading={isLoading}
                    buttonStyle={styles.changePasswordButton}
                    titleStyle={styles.buttonText}
                    icon={{
                      name: 'exchange',
                      type: 'font-awesome',
                      size: 16,
                      color: 'white'
                    }}
                    iconRight
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 26,
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    borderWidth: 2,
    borderColor: '#43e6f1ff',
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f9f9f9',
    marginBottom: 5,
  },
  userApartment: {
    fontSize: 16,
    color: '#f9f9f9',
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#f9f9f9',
    marginBottom: 10,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  divider: {
    backgroundColor: '#7a7777ff',
    marginBottom: 15,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    paddingHorizontal: 10,
  },
  inputError: {
    borderBottomColor: '#d32f2f',
  },
  inputText: {
    color: '#f9f9f9',
    fontSize: 16,
  },
  label: {
    color: '#f9f9f9',
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  buttonsContainer: {
    marginTop: 15,
    marginBottom: 25,
  },
  editButton: {
    backgroundColor: '#0a7e06ff',
    borderRadius: 8,
    paddingVertical: 14,
    height: 50,
  },
  saveButton: {
    backgroundColor: '#3aa13fff',
    borderRadius: 10,
    paddingVertical: 14,
    height: 50,
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    height: 50,
  },
  changePasswordButton: {
    backgroundColor: '#4527a0',
    borderRadius: 12,
    paddingVertical: 14,
    height: 50,
    marginTop: 10,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 16,
    marginRight: 10,
  },
  secondaryButtonContainer: {
    marginTop: 15,
  },
});

export default DadosMorador;