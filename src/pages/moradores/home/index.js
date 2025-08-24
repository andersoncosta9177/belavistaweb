// HomeMoradores.js
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../../../database/firebaseConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faBell, 
  faBox, 
  faCalendarAlt, 
  faExclamationCircle, 
  faTools, 
  faClipboard, 
  faBookOpen, 
  faNewspaper, 
  faHandsHelping, 
  faEye, 
  faUsers, 
  faIdCard, 
  faBook, 
  faBarcode, 
  faChartArea, 
  faIdCardAlt, 
  faPhone, 
  faCar 
} from '@fortawesome/free-solid-svg-icons';
import styles from './homeMoradores.module.css';

function HomeMoradores() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");

  const handleLogout = () => {
    if (window.confirm("Deseja sair da sua conta?")) {
      signOut(auth)
        .then(() => {
          navigate("/");
        })
        .catch((error) => {
          console.error("Erro ao sair:", error);
          alert("Não foi possível fazer logout");
        });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const portariaRef = ref(
          db,
          `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`
        );
        const snapshot = await get(portariaRef);
        
        if (!snapshot.exists()) {
          alert("Você não tem permissão para acessar esta área");
          await signOut(auth);
          navigate("/");
          return;
        }

        setNome(snapshot.val().nome);
        setUser(user);
      } else {
        navigate("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.gradientBackground}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.topIcons}>
            <button onClick={handleLogout} className={styles.iconButton}>
              <FontAwesomeIcon icon={faSignOutAlt} className={styles.gridIcon} />
            </button>
          <p className={styles.welcome}>Bem-vindo, {nome}</p>

            <button className={styles.iconButton}>
              <FontAwesomeIcon icon={faBell} className={styles.gridIcon} />
            </button>
          </div>
          <div className={styles.headerTitleMoradores}>
            <h1 className={styles.title}>Condomínio Residencial</h1>
            <h1 className={`${styles.title} ${styles.boldPortaria} ${styles.orangePortaria}`}>Bela Vista</h1>
          </div>
        </div>

        <div className={styles.gridContainer}>
          {/* First Row */}
          <Link to="/src/pages/moradores/pages/encomendas" className={styles.gridItem}>
            <FontAwesomeIcon icon={faBox} className={styles.gridIcon} />
            <span className={styles.gridText}>Encomendas</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/agenda/agendaHome" className={styles.gridItem}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.gridIcon} />
            <span className={styles.gridText}>Agenda</span>
          </Link>
          
          <Link to="/src/pages/portaria/pages/alertas/alertasEnviados" className={styles.gridItem}>
            <FontAwesomeIcon icon={faExclamationCircle} className={styles.gridIcon} />
            <span className={styles.gridText}>Alertas</span>
          </Link>

          {/* Second Row */}
          <Link to="/src/pages/moradores/pages/manutencao/manutencaoHome" className={styles.gridItem}>
            <FontAwesomeIcon icon={faTools} className={styles.gridIcon} />
            <span className={styles.gridText}>Manutenção</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/normas" className={styles.gridItem}>
            <FontAwesomeIcon icon={faClipboard} className={styles.gridIcon} />
            <span className={styles.gridText}>Normas</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/ocorrencia/homeOcorrencia" className={styles.gridItem}>
            <FontAwesomeIcon icon={faBookOpen} className={styles.gridIcon} />
            <span className={styles.gridText}>Ocorrência</span>
          </Link>

          {/* Third Row */}
          <Link to="/src/pages/moradores/pages/comunicados" className={styles.gridItem}>
            <FontAwesomeIcon icon={faNewspaper} className={styles.gridIcon} />
            <span className={styles.gridText}>Comunicados</span>
          </Link>
          
          <Link to="/moradores/prestadores-servicos" className={styles.gridItem}>
            <FontAwesomeIcon icon={faHandsHelping} className={styles.gridIcon} />
            <span className={styles.gridText}>Prest. serviços</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/transparencia" className={styles.gridItem}>
            <FontAwesomeIcon icon={faEye} className={styles.gridIcon} />
            <span className={styles.gridText}>Transparência</span>
          </Link>

          {/* Fourth Row */}
          <Link to="/src/pages/portaria/pages/colaboradores" className={styles.gridItem}>
            <FontAwesomeIcon icon={faUsers} className={styles.gridIcon} />
            <span className={styles.gridText}>Colaboradores</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/visitantes/visitantesHome" className={styles.gridItem}>
            <FontAwesomeIcon icon={faIdCard} className={styles.gridIcon} />
            <span className={styles.gridText}>Visitantes</span>
          </Link>
          
          <div className={styles.gridItem}>
            <FontAwesomeIcon icon={faBook} className={styles.gridIcon} />
            <span className={styles.gridText}>Atas</span>
          </div>

          {/* Fifth Row */}
          <div className={styles.gridItem}>
            <FontAwesomeIcon icon={faBarcode} className={styles.gridIcon} />
            <span className={styles.gridText}>Boletos</span>
          </div>
          
          <Link to="/src/pages/moradores/pages/relatorios" className={styles.gridItem}>
            <FontAwesomeIcon icon={faChartArea} className={styles.gridIcon} />
            <span className={styles.gridText}>Relatórios</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/meusDados" className={styles.gridItem}>
            <FontAwesomeIcon icon={faIdCardAlt} className={styles.gridIcon} />
            <span className={styles.gridText}>Meus dados</span>
          </Link>

          {/* Sixth Row */}
          <Link to="/src/pages/portaria/pages/contatos" className={styles.gridItem}>
            <FontAwesomeIcon icon={faPhone} className={styles.gridIcon} />
            <span className={styles.gridText}>Contatos</span>
          </Link>
          
          <Link to="/src/pages/moradores/pages/garagem/homeGaragem" className={styles.gridItem}>
            <FontAwesomeIcon icon={faCar} className={styles.gridIcon} />
            <span className={styles.gridText}>Garagem</span>
          </Link>
          
          <div className={`${styles.gridItem} ${styles.gridItemEmpty}`}></div>
        </div>
      </div>
    </div>
  );
}

export default HomeMoradores;