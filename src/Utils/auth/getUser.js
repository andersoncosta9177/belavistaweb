import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para obter o UID do usuário
export const getUserId = async () => {
  try {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) return storedUserId;
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      await AsyncStorage.setItem('userId', user.uid);
      return user.uid;
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter UID:", error);
    return null;
  }
};

// Função para obter o nome do morador baseado no UID
export const getUserNome = async (userId) => {
  try {
    if (!userId) return 'Morador não identificado';
    
    // Verifica se temos o nome no AsyncStorage
    const storedUserName = await AsyncStorage.getItem(`userName_${userId}`);
    if (storedUserName) return storedUserName;
    
    // Busca no Firebase Database
    const db = getDatabase();
    const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${userId}`);
    
    const snapshot = await new Promise((resolve) => {
      onValue(userRef, (snapshot) => {
        resolve(snapshot);
      }, { onlyOnce: true });
    });
    
    const userData = snapshot.val();
    const userName = userData?.nome || 'Morador não identificado';
    
    // Armazena localmente para uso futuro
    await AsyncStorage.setItem(`userName_${userId}`, userName);
    
    return userName;
  } catch (error) {
    console.error("Erro ao obter nome do usuário:", error);
    return 'Morador não identificado';
  }
};