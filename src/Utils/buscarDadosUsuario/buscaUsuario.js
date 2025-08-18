import { getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../../database/firebaseConfig"; // Ajuste o caminho conforme sua estrutura

/**
 * Busca os dados completos do usuário morador logado
 * @returns {Promise<Object>} Objeto com os dados do usuário ou null se não encontrar
 */
export async function buscarDadosUsuarioMorador() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.log("Nenhum usuário logado");
      return null;
    }

    const userRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return {
        uid: user.uid,
        ...snapshot.val()
      };
    } else {
      console.log("Usuário não encontrado no banco de dados");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    throw error; // Você pode tratar o erro conforme sua necessidade
  }
}