import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import styles from './contatos.module.css';
import {

  WhatsApp,
  Handyman
} from "@mui/icons-material";
function ContatosScreen() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const CONTATOS_COLLECTION = 'DadosBelaVista/administracao/contatos';

  useEffect(() => {
    const contatosRef = ref(db, CONTATOS_COLLECTION);
    
    const unsubscribe = onValue(contatosRef, (snapshot) => {
      const data = snapshot.val();
      const contatosArray = [];
      
      if (data) {
        Object.keys(data).forEach(key => {
          contatosArray.push({
            id: key,
            ...data[key]
          });
        });
        
        contatosArray.sort((a, b) => a.nome.localeCompare(b.nome));
      }
      
      setContatos(contatosArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const copiarContato = (telefone) => {
    navigator.clipboard.writeText(telefone).then(() => {
      alert('O telefone foi copiado para a área de transferência.');
    }).catch(err => {
      console.error('Erro ao copiar:', err);
    });
  };



  const enviarWhatsApp = (telefone) => {
    const numero = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}`, '_blank').catch(err => {
      alert('Não foi possível abrir o WhatsApp');
      console.error('Erro ao abrir WhatsApp:', err);
    });
  };

  const formatarTelefone = (telefone) => {
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } 
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  };

  if (loading && contatos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Carregando contatos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <h1 className={styles.title}>Contatos Importantes</h1>
        
        <span className={styles.badge}>{contatos.length}</span>
      </div>

      {/* Lista de Contatos */}
      <div className={styles.listContainer}>
        {contatos.length === 0 ? (
          <div className={styles.emptyCard}>
            <span className={styles.emptyIcon}>👥</span>
            <p className={styles.emptyText}>Nenhum contato disponível</p>
          </div>
        ) : (
          contatos.map(contato => (
            <div key={contato.id} className={styles.contatoCard}>
              <div className={styles.contatoHeader}>
                <div className={styles.contatoInfo}>
                  <span className={styles.contatoIcon}>👤</span>
                  <div className={styles.contatoTextContainer}>
                    <h3 className={styles.contatoNome}>{contato.nome}</h3>
                    <p className={styles.contatoTelefone}>{formatarTelefone(contato.telefone)}</p>
                  </div>
                </div>
              </div>
              
              {contato.descricao && (
                <>
                  <div className={styles.divider}></div>
                  <div className={styles.descricaoContainer}>
                    <span className={styles.descricaoIcon}>ℹ️</span>
                    <p className={styles.contatoDescricao}>{contato.descricao}</p>
                  </div>
                </>
              )}

              <div className={styles.divider}></div>

              <div className={styles.actionsContainer}>
            

                <button 
                  className={`${styles.actionButton} ${styles.whatsappButton}`}
                  onClick={() => enviarWhatsApp(contato.telefone)}
                >
                  <WhatsApp className={styles.buttonIcon} />
                  <span className={styles.actionButtonText}>WhatsApp</span>
                </button>

                <button 
                  className={`${styles.actionButton} ${styles.copyButton}`}
                  onClick={() => copiarContato(contato.telefone)}
                >
                  <span className={styles.buttonIcon}>📋</span>
                  <span className={styles.actionButtonText}>Copiar</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ContatosScreen;