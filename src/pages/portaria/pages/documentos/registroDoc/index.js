import React, { useState, useEffect } from 'react';
import { ref, push, get } from 'firebase/database';
import { db } from '../../../../../database/firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileAlt, 
  faSignInAlt, 
  faSignOutAlt, 
  faBuilding, 
  faUser, 
  faFile, 
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import styles from './ProtocoloDocumentos.module.css';

const ProtocoloDocumentos = () => {
  const [tipoOperacao, setTipoOperacao] = useState('entrada');
  const [departamento, setDepartamento] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [documento, setDocumento] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nomePorteiro, setNomePorteiro] = useState('');

  // Busca o porteiro logado
  useEffect(() => {
    const buscarPorteiro = async () => {
      try {
        const codigo = localStorage.getItem("codigo");
        if (!codigo) throw new Error("Código não encontrado");

        const snapshot = await get(
          ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}/nome`)
        );
        if (snapshot.exists()) {
          setNomePorteiro(snapshot.val());
        }
      } catch (error) {
        alert("Erro: " + error.message);
      }
    };

    buscarPorteiro();
  }, []);

  const handleSubmit = async () => {
    if (!departamento || !responsavel) {
      alert('Atenção: Preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const protocolosRef = ref(db, 'DadosBelaVista/administracao/protocolos');
      
      const novoProtocolo = {
        tipo: tipoOperacao,
        departamento,
        responsavel,
        documento: documento || 'Não informado',
        nomePorteiro,
        data: new Date().toISOString(),
      };

      await push(protocolosRef, novoProtocolo);
      
      alert(`✅ Sucesso! Protocolo de ${tipoOperacao === 'entrada' ? 'entrada' : 'saída'} registrado!`);
      
      // Limpa os campos
      setDepartamento('');
      setResponsavel('');
      setDocumento('');
    } catch (error) {
      console.error('Erro ao salvar protocolo:', error);
      alert('❌ Erro: Não foi possível registrar o protocolo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.gradientBackground}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FontAwesomeIcon icon={faFileAlt} className={styles.headerIcon} />
          <h1 className={styles.title}>Protocolo de Documentos</h1>
          {nomePorteiro && <p className={styles.porteiroText}>Porteiro: {nomePorteiro}</p>}
        </div>

        <div className={styles.formContainer}>
          {/* Seletor de Tipo */}
          <div className={styles.tipoContainer}>
            <button
              className={`${styles.tipoButton} ${tipoOperacao === 'entrada' ? styles.tipoButtonActive : ''}`}
              onClick={() => setTipoOperacao('entrada')}
            >
              <FontAwesomeIcon 
                icon={faSignInAlt} 
                className={styles.tipoIcon} 
                style={{ color: tipoOperacao === 'entrada' ? '#FFF' : '#0F98A1' }}
              />
              <span className={`${styles.tipoButtonText} ${tipoOperacao === 'entrada' ? styles.tipoButtonTextActive : ''}`}>
                Entrada
              </span>
            </button>

            <button
              className={`${styles.tipoButton} ${tipoOperacao === 'saida' ? styles.tipoButtonActive : ''}`}
              onClick={() => setTipoOperacao('saida')}
            >
              <FontAwesomeIcon 
                icon={faSignOutAlt} 
                className={styles.tipoIcon} 
                style={{ color: tipoOperacao === 'saida' ? '#FFF' : '#e74c3c' }}
              />
              <span className={`${styles.tipoButtonText} ${tipoOperacao === 'saida' ? styles.tipoButtonTextActive : ''}`}>
                Saída
              </span>
            </button>
          </div>

          {/* Campos do Formulário */}
          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <FontAwesomeIcon icon={faBuilding} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Departamento*"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
              <input
                type="text"
                placeholder={tipoOperacao === 'entrada' ? "Recebido por*" : "Entregue para*"}
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <FontAwesomeIcon icon={faFile} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="Número do documento (opcional)"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <span>Salvando...</span>
                <div className={styles.spinner}></div>
              </div>
            ) : (
              <>
                <span>Salvar Protocolo</span>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.buttonIcon} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtocoloDocumentos;