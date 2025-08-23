import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "../../../database/firebaseConfig";
import { Link } from "react-router-dom";
import { 
  Logout,
  Notifications,
  Article,
  CalendarToday,
  Warning,
  Build,
  Description,
  MenuBook,
  Groups,
  Visibility,
  VpnKey,
  Contacts,
  DirectionsCar,
  InsertDriveFile,
  AccountCircle,
  Handyman,
  Assessment,
  Help
} from "@mui/icons-material";
import styles from './homesindico.module.css'

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
      <div className={styles.gradientBackground + " " + styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topIcons}>
          <button onClick={handleLogout} className={styles.iconButton}>
            <Logout fontSize="medium" className={styles.icon} />
          </button>
          <p className={styles.welcome}>Administração</p>
          <button className={styles.iconButton}>
            <Notifications fontSize="medium" className={styles.icon} />
          </button>
        </div>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>Condomínio Residencial</h1>
          <h1 className={styles.title + " " + styles.bold + " " + styles.orange}>Bela Vista</h1>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {/* Primeira Linha */}
        <Link to="/sindico/comunicados/comunicados-home" className={styles.gridItem}>
          <Article fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Comunicados</span>
        </Link>

        <Link to="/sindico/agenda/agenda-home" className={styles.gridItem}>
          <CalendarToday fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Agenda</span>
        </Link>

        <Link to="/portaria/alertas" className={styles.gridItem}>
          <Warning fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Alertas</span>
        </Link>

        {/* Segunda Linha */}
        <Link to="/portaria/manutencao" className={styles.gridItem}>
          <Build fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Manutenção</span>
        </Link>

        <Link to="/sindico/normas" className={styles.gridItem}>
          <Description fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Normas</span>
        </Link>

        <Link to="/sindico/ocorrencias" className={styles.gridItem}>
          <MenuBook fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Ocorrências</span>
        </Link>

        {/* Terceira Linha */}
        <Link to="/sindico/moradores" className={styles.gridItem}>
          <Groups fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Moradores</span>
        </Link>

        <Link to="/sindico/atas" className={styles.gridItem}>
          <Description fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Atas</span>
        </Link>

        <Link to="/sindico/transparencia" className={styles.gridItem}>
          <Visibility fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Transparência</span>
        </Link>

        {/* Quarta Linha */}
        <Link to="/sindico/tokens" className={styles.gridItem}>
          <VpnKey fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Tokens</span>
        </Link>

        <Link to="/sindico/contatos" className={styles.gridItem}>
          <Contacts fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Contatos</span>
        </Link>

        <Link to="/sindico/garagem" className={styles.gridItem}>
          <DirectionsCar fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Garagem</span>
        </Link>

        {/* Quinta Linha */}
        <Link to="/portaria/documentos" className={styles.gridItem}>
          <InsertDriveFile fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Documentos</span>
        </Link>

        <Link to="/sindico/meus-dados" className={styles.gridItem}>
          <AccountCircle fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Meus Dados</span>
        </Link>

        <Link to="/moradores/prestadores-servicos" className={styles.gridItem}>
          <Handyman fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Prest. serviços</span>
        </Link>

        {/* Sexta Linha */}
        <Link to="/sindico/relatorios" className={styles.gridItem}>
          <Assessment fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Relatórios</span>
        </Link>

        <Link to="/sindico/ajuda" className={styles.gridItem}>
          <Help fontSize="medium" className={styles.gridIcon} />
          <span className={styles.gridText}>Ajuda</span>
        </Link>

        <div className={styles.gridItem + " " + styles.empty}></div>
      </div>
    </div>
  );
}

export default HomeSindico;