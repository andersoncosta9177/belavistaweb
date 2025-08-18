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
import "../../../../src/styles/stylesHomeUsers.css"


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
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="gradient-background">
      <div className="container">
        <div className="header">
          <div className="top-icons">
            <button onClick={handleLogout} className="icon-button">
              <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
            </button>
            <button className="icon-button">
              <FontAwesomeIcon icon={faBell} className="icon" />
            </button>
          </div>
          <h1 className="title">Condomínio Residencial</h1>
          <h1 className="title bold orange">Bela Vista</h1>
          <p className="welcome">Bem-vindo, {nome}</p>
        </div>

        <div className="grid-container">
          {/* First Row */}
          <div className="grid-row">
            <Link to="/src/pages/moradores/pages/encomendas" className="grid-item">
              <FontAwesomeIcon icon={faBox} className="grid-icon" />
              <span className="grid-text">Encomendas</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/agenda/agendaHome" className="grid-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="grid-icon" />
              <span className="grid-text">Agenda</span>
            </Link>
            
            <Link to="/src/pages/portaria/pages/alertas/alertasEnviados" className="grid-item">
              <FontAwesomeIcon icon={faExclamationCircle} className="grid-icon" />
              <span className="grid-text">Alertas</span>
            </Link>
          </div>

          {/* Second Row */}
          <div className="grid-row">
            <Link to="/src/pages/moradores/pages/manutencao/manutencaoHome" className="grid-item">
              <FontAwesomeIcon icon={faTools} className="grid-icon" />
              <span className="grid-text">Manutenção</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/normas" className="grid-item">
              <FontAwesomeIcon icon={faClipboard} className="grid-icon" />
              <span className="grid-text">Normas</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/ocorrencia/homeOcorrencia" className="grid-item">
              <FontAwesomeIcon icon={faBookOpen} className="grid-icon" />
              <span className="grid-text">Ocorrência</span>
            </Link>
          </div>

          {/* Third Row */}
          <div className="grid-row">
            <Link to="/src/pages/moradores/pages/comunicados" className="grid-item">
              <FontAwesomeIcon icon={faNewspaper} className="grid-icon" />
              <span className="grid-text">Comunicados</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/prestadoresServicos" className="grid-item">
              <FontAwesomeIcon icon={faHandsHelping} className="grid-icon" />
              <span className="grid-text">Prest. serviços</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/transparencia" className="grid-item">
              <FontAwesomeIcon icon={faEye} className="grid-icon" />
              <span className="grid-text">Transparência</span>
            </Link>
          </div>

          {/* Fourth Row */}
          <div className="grid-row">
            <Link to="/src/pages/portaria/pages/colaboradores" className="grid-item">
              <FontAwesomeIcon icon={faUsers} className="grid-icon" />
              <span className="grid-text">Colaboradores</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/visitantes/visitantesHome" className="grid-item">
              <FontAwesomeIcon icon={faIdCard} className="grid-icon" />
              <span className="grid-text">Visitantes</span>
            </Link>
            
            <div className="grid-item">
              <FontAwesomeIcon icon={faBook} className="grid-icon" />
              <span className="grid-text">Atas</span>
            </div>
          </div>

          {/* Fifth Row */}
          <div className="grid-row">
            <div className="grid-item">
              <FontAwesomeIcon icon={faBarcode} className="grid-icon" />
              <span className="grid-text">Boletos</span>
            </div>
            
            <Link to="/src/pages/moradores/pages/relatorios" className="grid-item">
              <FontAwesomeIcon icon={faChartArea} className="grid-icon" />
              <span className="grid-text">Relatórios</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/meusDados" className="grid-item">
              <FontAwesomeIcon icon={faIdCardAlt} className="grid-icon" />
              <span className="grid-text">Meus dados</span>
            </Link>
          </div>

          {/* Sixth Row */}
          <div className="grid-row">
            <Link to="/src/pages/portaria/pages/contatos" className="grid-item">
              <FontAwesomeIcon icon={faPhone} className="grid-icon" />
              <span className="grid-text">Contatos</span>
            </Link>
            
            <Link to="/src/pages/moradores/pages/garagem/homeGaragem" className="grid-item">
              <FontAwesomeIcon icon={faCar} className="grid-icon" />
              <span className="grid-text">Garagem</span>
            </Link>
            
            <div className="grid-item empty"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeMoradores;