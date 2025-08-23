import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import styles from './manutencao.module.css';

const ListaPedidosManutencao = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pedidosRef = ref(db, 'DadosBelaVista/DadosGerais/Manutencoes');
    const unsubscribe = onValue(pedidosRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Dados recebidos:", data);
      if (data) {
        const todosPedidos = [];
        Object.keys(data).forEach((pedidoId) => {
          todosPedidos.push({
            id: pedidoId,
            userId: data[pedidoId].userId,
            ...data[pedidoId]
          });
        });
        setPedidos(todosPedidos);
      } else {
        setPedidos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSwitch = (pedidoId, userId, novoStatus) => {
    const pedidoRef = ref(db, `DadosBelaVista/DadosGerais/Manutencoes/${pedidoId}`);
    const dadosAtualizados = {
      status: novoStatus,
      ...(novoStatus && { dataConclusao: new Date().toISOString() })
    };

    update(pedidoRef, dadosAtualizados)
      .then(() => {
        setPedidos(prevPedidos =>
          prevPedidos.map(pedido =>
            pedido.id === pedidoId
              ? { ...pedido, status: novoStatus, dataConclusao: novoStatus ? new Date().toISOString() : null }
              : pedido
          )
        );
      })
      .catch((error) => {
        console.error('Erro ao atualizar o status:', error);
        alert('Erro: Não foi possível atualizar o status');
      });
  };

  const renderItem = (item) => {
    const isConcluido = item.status === true;
    const statusText = isConcluido ? 'CONCLUÍDO' : 'PENDENTE';

    return (
      <div key={item.id} className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={`${styles.avatar} ${isConcluido ? styles.concluido : styles.pendente}`}>
            <span className={styles.avatarIcon}>🔧</span>
          </div>
          <div className={styles.headerTextContainer}>
            <h3 className={styles.titulo}>{item.titulo}</h3>
            <span className={`${styles.badge} ${isConcluido ? styles.badgeSuccess : styles.badgeError}`}>
              {statusText}
            </span>
          </div>
        </div>

        <div className={styles.divider}></div>

        <p className={styles.descricao}>{item.descricao}</p>

        <div className={styles.footer}>
          <div className={styles.footerRow}>
            <span className={styles.footerIcon}>📅</span>
            <span className={styles.footerText}>
              Solicitado em: {new Date(item.data).toLocaleDateString('pt-BR')}
            </span>
          </div>

          {isConcluido && item.dataConclusao && (
            <div className={styles.footerRow}>
              <span className={styles.footerIcon} style={{color: '#4CAF50'}}>✅</span>
              <span className={styles.footerText}>
                Concluído em: {new Date(item.dataConclusao).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}

          <div className={styles.switchContainer}>
            <span className={styles.switchLabel}>
              {isConcluido ? 'Marcar como pendente' : 'Marcar como concluído'}
            </span>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={isConcluido}
                onChange={(e) => toggleSwitch(item.id, item.userId, e.target.checked)}
              />
              <span className={`${styles.slider} ${styles.round}`} style={{backgroundColor: isConcluido ? '#4CAF50' : '#ccc'}}></span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className={styles.gradientContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Pedidos de Manutenção</h1>
          <span className={styles.countBadge}>{pedidos.length}</span>
        </div>

        {pedidos.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyIcon}>🔧</span>
            <p className={styles.emptyText}>Nenhum pedido de manutenção</p>
          </div>
        ) : (
          <div className={styles.listContainer}>
            {pedidos.map((pedido) => renderItem(pedido))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaPedidosManutencao;