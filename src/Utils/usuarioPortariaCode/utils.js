import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para salvar o código do usuário
export const saveUserCode = async (codigo) => {
  try {
    await AsyncStorage.setItem('userCode', codigo);
  } catch (error) {
    console.error('Erro ao salvar o código do usuário:', error);
  }
};

// Função para recuperar o código do usuário
export const getUserCode = async () => {
  try {
    const codigo = await AsyncStorage.getItem('userCode');
    return codigo;
  } catch (error) {
    console.error('Erro ao recuperar o código do usuário:', error);
    return null;
  }
};

// Função para remover o código do usuário (logout)
export const removeUserCode = async () => {
  try {
    await AsyncStorage.removeItem('userCode');
  } catch (error) {
    console.error('Erro ao remover o código do usuário:', error);
  }
};