import { ref, get } from 'firebase/database';
import { db } from '../../database/firebaseConfig'; // Importa o Firebase Database

// Função para buscar os tokens dos moradores no Firebase
export const getMoradoresTokens = async () => {
  try {
    const moradoresRef = ref(db, 'DadosBelaVista/usuarios/usuarioMorador'); // Ajuste conforme sua estrutura
    const snapshot = await get(moradoresRef);

    if (!snapshot.exists()) {
      return [];
    }

    // Converte os dados do Firebase para um array de objetos
    return Object.entries(snapshot.val()).map(([userId, userData]) => ({
      userId,
      expoPushToken: userData.expoPushToken || null, // Token de notificação
    })).filter(user => user.expoPushToken); // Filtra usuários sem token
  } catch (error) {
    console.error("Erro ao buscar tokens dos moradores:", error);
    return [];
  }
};
