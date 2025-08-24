import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import styles from './colaboradores.module.css';

function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Simulando o AsyncStorage do React Native
    const fetchCurrentUser = async () => {
      // No navegador, podemos usar localStorage
      const codigo = localStorage.getItem('codigo');
      setCurrentUser(codigo);
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const colaboradoresRef = ref(db, 'DadosBelaVista/RegistroFuncionario/Tokens');
    
    const unsubscribe = onValue(colaboradoresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const colaboradoresArray = Object.keys(data).map(key => ({
          id: key,
          nome: data[key].nome || 'Nome não disponível',
          funcao: data[key].funcao || 'Função não definida',
          emServico: data[key].emServico || false,
          isCurrentUser: key === currentUser
        })).filter(colab => 
          colab.funcao.toLowerCase() === 'zelador' || 
          colab.funcao.toLowerCase() === 'porteiro'
        );
        
        // Ordena para colocar o usuário atual primeiro
        colaboradoresArray.sort((a, b) => b.isCurrentUser - a.isCurrentUser);
        setColaboradores(colaboradoresArray);
      } else {
        setColaboradores([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

const toggleServico = async (id) => {
  try {
    // Busca o valor atual diretamente do Firebase em vez de confiar no estado local
    const colaboradorRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${id}`);
    
    onValue(colaboradorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const novoEstado = !data.emServico;
        
        const updates = {};
        updates[`DadosBelaVista/RegistroFuncionario/Tokens/${id}/emServico`] = novoEstado;
        
        update(ref(db), updates)
          .then(() => console.log("Status atualizado com sucesso"))
          .catch((error) => {
            console.error("Erro ao atualizar status:", error);
            alert("Erro", "Não foi possível atualizar o status");
          });
      }
    }, { onlyOnce: true }); // Apenas executa uma vez

  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    alert("Erro", "Não foi possível atualizar o status");
  }
};

  const getIconByFunction = (funcao) => {
    switch(funcao.toLowerCase()) {
      case 'porteiro':
        return <span className={styles.funcaoIcon}>👮</span>;
      case 'zelador':
        return <span className={styles.funcaoIcon}>🔧</span>;
      default:
        return <span className={styles.funcaoIcon}>👤</span>;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Colaboradores</h1>
        <p className={styles.headerSubtitle}>Porteiros e Zeladores</p>
      </div>

      {colaboradores.length > 0 ? (
        <div className={styles.listContainer}>
          {colaboradores.map((item) => (
            <div
              key={item.id}
              className={`${styles.card} ${item.isCurrentUser ? styles.currentUserCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.iconContainer}>
                  {getIconByFunction(item.funcao)}
                </div>
                
                <div className={styles.textContainer}>
                  <h3 className={styles.nome}>{item.nome}</h3>
                  <p className={styles.funcao}>{item.funcao}</p>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <div className={`${styles.statusContainer} ${item.emServico ? styles.emServico : styles.foraServico}`}>
                  <span className={styles.statusText}>
                    {item.emServico ? 'Em serviço' : 'Fora de serviço'}
                  </span>
                </div>
                
                {item.isCurrentUser && (
                  <div className={styles.switchContainer}>
                    <span className={styles.switchLabel}>
                      {item.emServico ? 'Em serviço' : 'Fora de serviço'}
                    </span>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={item.emServico}
                        onChange={() => toggleServico(item.id)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyContainer}>
          <span className={styles.emptyIcon}>👥</span>
          <p className={styles.emptyText}>Nenhum colaborador cadastrado</p>
        </div>
      )}
    </div>
  );
}

export default Colaboradores;