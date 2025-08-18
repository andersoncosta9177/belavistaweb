import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../../../database/firebaseConfig";
import { 
  MdLogout, MdNotifications, MdNewspaper, MdCalendarToday, MdWarning, 
  MdBuild, MdAssignment, MdMenuBook, MdPeople, MdDescription, 
  MdVisibility, MdVpnKey, MdContacts, MdDirectionsCar, MdInsertDriveFile,
  MdAccountCircle, MdHandyman, MdAssessment, MdHelp 
} from "react-icons/md";
import "../../../../src/styles/stylesHomeUsers.css"
function HomeSindico() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    if (window.confirm("Deseja sair da sua conta?")) {
      signOut(auth).catch((error) => {
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
          `DadosBelaVista/usuarios/usuarioCondominio/${user.uid}`
        );
        const snapshot = await get(portariaRef);

        if (!snapshot.exists()) {
          alert("Acesso Negado\nVocê não tem permissão para acessar esta área");
          await signOut(auth);
          navigate("/");
          return;
        }

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
      </div>
    );
  }

return (
  <div className="gradient-background">
    <div className="container">
      <div className="header">
        <div className="top-icons">
          <button onClick={handleLogout} className="icon-button">
            <MdLogout className="icon" size={25} />
          </button>
          <button className="icon-button">
            <MdNotifications className="icon" size={30} />
          </button>
        </div>
        <h1 className="title">Condomínio Residencial</h1>
        <h1 className="title bold orange">Bela Vista</h1>
        <p className="welcome">Administração</p>
      </div>

      <div className="grid-container">
        {/* Primeira Linha */}
        <div className="grid-row">
          <div className="grid-item" onClick={() => navigate("/sindico/comunicados/comunicados-home")}>
            <MdNewspaper className="grid-icon" size={35} />
            <span className="grid-text">Comunicados</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/agenda")}>
            <MdCalendarToday className="grid-icon" size={35} />
            <span className="grid-text">Agenda</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/portaria/alertas")}>
            <MdWarning className="grid-icon" size={35} />
            <span className="grid-text">Alertas</span>
          </div>
        </div>

        {/* Segunda Linha */}
        <div className="grid-row">
          <div className="grid-item" onClick={() => navigate("/sindico/manutencao")}>
            <MdBuild className="grid-icon" size={35} />
            <span className="grid-text">Manutenção</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/normas")}>
            <MdAssignment className="grid-icon" size={35} />
            <span className="grid-text">Normas</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/ocorrencias")}>
            <MdMenuBook className="grid-icon" size={35} />
            <span className="grid-text">Ocorrências</span>
          </div>
        </div>

        {/* Terceira Linha */}
        <div className="grid-row">
          <div className="grid-item" onClick={() => navigate("/sindico/moradores")}>
            <MdPeople className="grid-icon" size={35} />
            <span className="grid-text">Moradores</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/atas")}>
            <MdDescription className="grid-icon" size={35} />
            <span className="grid-text">Atas</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/transparencia")}>
            <MdVisibility className="grid-icon" size={35} />
            <span className="grid-text">Transparência</span>
          </div>
        </div>

        {/* Quarta Linha */}
        <div className="grid-row">
          <div className="grid-item" onClick={() => navigate("/sindico/tokens")}>
            <MdVpnKey className="grid-icon" size={35} />
            <span className="grid-text">Tokens</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/contatos")}>
            <MdContacts className="grid-icon" size={35} />
            <span className="grid-text">Contatos</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/garagem")}>
            <MdDirectionsCar className="grid-icon" size={35} />
            <span className="grid-text">Garagem</span>
          </div>
        </div>

        {/* Quinta Linha */}
        <div className="grid-row">
          <div className="grid-item" onClick={() => navigate("/portaria/documentos")}>
            <MdInsertDriveFile className="grid-icon" size={35} />
            <span className="grid-text">Documentos</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/meus-dados")}>
            <MdAccountCircle className="grid-icon" size={35} />
            <span className="grid-text">Meus Dados</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/moradores/prestadores-servicos")}>
            <MdHandyman className="grid-icon" size={35} />
            <span className="grid-text">Prest. serviços</span>
          </div>
        </div>

        {/* Sexta Linha */}
        <div className="grid-row">
          <div className="grid-item" onClick={() => navigate("/sindico/relatorios")}>
            <MdAssessment className="grid-icon" size={35} />
            <span className="grid-text">Relatórios</span>
          </div>
          
          <div className="grid-item" onClick={() => navigate("/sindico/ajuda")}>
            <MdHelp className="grid-icon" size={35} />
            <span className="grid-text">Ajuda</span>
          </div>
          
          <div className="grid-item empty"></div>
        </div>
      </div>
    </div>
  </div>
);
}

// Componente auxiliar para os ícones
function IconBox({ icon, text, onClick, size = "normal" }) {
  const boxClass = size === "large" ? "icon-box-large" : 
                  size === "medium" ? "icon-box-medium" : "icon-box";
  
  return (
    <div className={boxClass} onClick={onClick}>
      <div className="icon">{icon}</div>
      <span className="icon-text">{text}</span>
    </div>
  );
}

export default HomeSindico;