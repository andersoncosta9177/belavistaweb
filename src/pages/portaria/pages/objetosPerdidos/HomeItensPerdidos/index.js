
import React from "react";
import { Link } from "react-router-dom";
import { 
  MdOutlineSearch ,
  MdCreate,
} from "react-icons/md";
import "../../../../../styles/stylesHome.css";

function ItensPerdidosHome() {
  return (
    <div className="container-center">
      <div className="content-wrapper">
        <div className="buttons-grid">
          <Link 
            to="/src/pages/portaria/alertas/alerta-home" 
            className="card-button"
          >
         <MdCreate style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Registrar</span>
          </Link>

          <Link 
            to="/src/pages/portaria/pages/objetos-perdidos/cadastro-itens-perdidos" 
            className="card-button"
          >
           <MdOutlineSearch style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Registrados</span>
          </Link>

 
        </div>
      </div>
    </div>
  );
}

export default ItensPerdidosHome;