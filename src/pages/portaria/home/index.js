import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db } from "../../../database/firebaseConfig";
import { ref, get } from "firebase/database";
import {
  Logout,
  Notifications,
  Inventory,
  CalendarToday,
  Warning,
  Build,
  Description,
  MenuBook,
  Groups,
  Contacts,
  Article,
  Badge,
  LocalShipping,
  DirectionsCar,
  Handyman
} from "@mui/icons-material";
import styles from './stylesHomePortaria.module.css';

function HomePortaria() {
  const navigate = useNavigate();
  const { codigo } = useParams();
  const [nomeFuncionario, setNomeFuncionario] = useState("");
  const [loading, setLoading] = useState(true);
  
  const logout = async () => {
    if (window.confirm("Deseja realmente sair?")) {
      try {
        localStorage.removeItem("codigo");
        navigate("/");
      } catch (error) {
        console.error("Erro ao deslogar:", error);
        alert("Não foi possível fazer logout.");
      }
    }
  };

  useEffect(() => {
    const fetchUserName = async () => {
      if (!codigo) {
        alert("Erro: Código do funcionário não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const funcionarioRef = ref(db, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}`);
        const snapshot = await get(funcionarioRef);

        if (snapshot.exists()) {
          const funcionarioData = snapshot.val();
          setNomeFuncionario(funcionarioData.nome || "Nome não encontrado");
        } else {
          alert("Funcionário não encontrado com este código");
        }
      } catch (error) {
        console.error("Erro ao buscar nome:", error);
        alert("Erro: Não foi possível carregar os dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [codigo]);

  if (loading) {
    return (
      <div className={styles.loadingContainerPortaria}>
        <div className={styles.spinnerPortaria}></div>
      </div>
    );
  }

  return (
    <div className={styles.gradientBackgroundPortaria}>
      <div className={styles.containerPortaria}>
        <div className={styles.headerPortaria}>
          <div className={styles.topIconsPortaria}>
            <button onClick={logout} className={styles.iconButtonPortaria}>
              <Logout fontSize="medium" className={styles.gridIconPortaria} />
            </button>
            <p className={styles.welcomePortaria}>Portaria - Bem-vindo, {nomeFuncionario}</p>
            <button className={styles.iconButtonPortaria}>
              <Notifications fontSize="medium" className={styles.gridIconPortaria} />
            </button>
          </div>
          <div className={styles.headerTitlePortaria}>
            <h1 className={styles.titlePortaria}>Condomínio Residencial</h1>
            <h1 className={`${styles.titlePortaria} ${styles.boldPortaria} ${styles.orangePortaria}`}>Bela Vista</h1>
          </div>
        </div>

        <div className={styles.gridContainerPortaria}>
          {/* Primeira Linha */}
          <Link to="/portaria/encomendas/index.js" className={styles.gridItemPortaria}>
            <Inventory fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Encomendas</span>
          </Link>

          <Link to="/portaria/agenda/agenda-home" className={styles.gridItemPortaria}>
            <CalendarToday fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Agenda</span>
          </Link>

          <Link to="/portaria/alertas/alertas-home" className={styles.gridItemPortaria}>
            <Warning fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Alertas</span>
          </Link>

          {/* Segunda Linha */}
          <Link to="/portaria/manutencao" className={styles.gridItemPortaria}>
            <Build fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Manutenção</span>
          </Link>

          <Link to="/portaria/normas" className={styles.gridItemPortaria}>
            <Description fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Normas</span>
          </Link>

          <Link to="/portaria/ocorrencia/home-ocorrencia" className={styles.gridItemPortaria}>
            <MenuBook fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Ocorrências</span>
          </Link>

          {/* Terceira Linha */}
          <Link to="/portaria/moradores-info" className={styles.gridItemPortaria}>
            <Groups fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Moradores</span>
          </Link>

          <Link to="/portaria/contatos" className={styles.gridItemPortaria}>
            <Contacts fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Contatos</span>
          </Link>

          <Link to="/portaria/comunicados" className={styles.gridItemPortaria}>
            <Article fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Comunicados</span>
          </Link>

          {/* Quarta Linha */}
          <Link to="/portaria/visitantes" className={styles.gridItemPortaria}>
            <Badge fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Visitantes</span>
          </Link>

          <Link to="/portaria/objetos-perdidos" className={styles.gridItemPortaria}>
            <LocalShipping fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Objetos Perdidos</span>
          </Link>

          <Link to="/portaria/garagem" className={styles.gridItemPortaria}>
            <DirectionsCar fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Garagem</span>
          </Link>

          {/* Quinta Linha */}
          <Link to="/portaria/colaboradores" className={styles.gridItemPortaria}>
            <Groups fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Colaboradores</span>
          </Link>

          <Link to="/portaria/documentos" className={styles.gridItemPortaria}>
            <Description fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Documentos</span>
          </Link>

          <Link to="/moradores/prestadores-servicos" className={styles.gridItemPortaria}>
            <Handyman fontSize="medium" className={styles.gridIconPortaria} />
            <span className={styles.gridTextPortaria}>Prest. Serviços</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePortaria;