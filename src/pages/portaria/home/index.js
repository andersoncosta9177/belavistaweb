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
import '../../../../src/styles/stylesHomeUsers.css'

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
      console.log("Dados do funcionário:", snapshot.val());

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
      <div className="gradient-background loading">
        <div className="spinner"></div>
      </div>
    );
  }

return (
  <div className="gradient-background">
    <div className="container">
      <div className="header">
        <div className="top-icons">
          <button onClick={logout} className="icon-button">
            <Logout fontSize="medium" className="icon" />
          </button>
        <p className="welcome">Bem-vindo, {nomeFuncionario}</p>

          <button className="icon-button">
            <Notifications fontSize="medium" className="icon" />
          </button>
        </div>
      <div className="header-title">
          <h1 className="title">Condomínio Residencial</h1>
        <h1 className="title bold orange">Bela Vista</h1>
      </div>
      </div>

      <div className="grid-container">
        {/* Primeira Linha */}
        <div className="grid-row">
          <Link to="/portaria/encomendas" className="grid-item">
            <Inventory fontSize="medium" className="grid-icon" />
            <span className="grid-text">Encomendas</span>
          </Link>

          <Link to="/portaria/agenda" className="grid-item">
            <CalendarToday fontSize="medium" className="grid-icon" />
            <span className="grid-text">Agenda</span>
          </Link>

          <Link to="/portaria/alertas" className="grid-item">
            <Warning fontSize="medium" className="grid-icon" />
            <span className="grid-text">Alertas</span>
          </Link>
        </div>

        {/* Segunda Linha */}
        <div className="grid-row">
          <Link to="/portaria/manutencao" className="grid-item">
            <Build fontSize="medium" className="grid-icon" />
            <span className="grid-text">Manutenção</span>
          </Link>

          <Link to="/portaria/normas" className="grid-item">
            <Description fontSize="medium" className="grid-icon" />
            <span className="grid-text">Normas</span>
          </Link>

          <Link to="/portaria/ocorrencias" className="grid-item">
            <MenuBook fontSize="medium" className="grid-icon" />
            <span className="grid-text">Ocorrências</span>
          </Link>
        </div>

        {/* Terceira Linha */}
        <div className="grid-row">
          <Link to="/portaria/moradores" className="grid-item">
            <Groups fontSize="medium" className="grid-icon" />
            <span className="grid-text">Moradores</span>
          </Link>

          <Link to="/portaria/contatos" className="grid-item">
            <Contacts fontSize="medium" className="grid-icon" />
            <span className="grid-text">Contatos</span>
          </Link>

          <Link to="/portaria/comunicados" className="grid-item">
            <Article fontSize="medium" className="grid-icon" />
            <span className="grid-text">Comunicados</span>
          </Link>
        </div>

        {/* Quarta Linha */}
        <div className="grid-row">
          <Link to="/portaria/visitantes" className="grid-item">
            <Badge fontSize="medium" className="grid-icon" />
            <span className="grid-text">Visitantes</span>
          </Link>

          <Link to="/portaria/objetos-perdidos" className="grid-item">
            <LocalShipping fontSize="medium" className="grid-icon" />
            <span className="grid-text">Objetos Perdidos</span>
          </Link>

          <Link to="/portaria/garagem" className="grid-item">
            <DirectionsCar fontSize="medium" className="grid-icon" />
            <span className="grid-text">Garagem</span>
          </Link>
        </div>

        {/* Quinta Linha */}
        <div className="grid-row">
          <Link to="/portaria/colaboradores" className="grid-item">
            <Groups fontSize="medium" className="grid-icon" />
            <span className="grid-text">Colaboradores</span>
          </Link>

          <Link to="/portaria/documentos" className="grid-item">
            <Description fontSize="medium" className="grid-icon" />
            <span className="grid-text">Documentos</span>
          </Link>

          <Link to="/portaria/prestadores-servicos" className="grid-item">
            <Handyman fontSize="medium" className="grid-icon" />
            <span className="grid-text">Prest. Serviços</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);
}

export default HomePortaria;