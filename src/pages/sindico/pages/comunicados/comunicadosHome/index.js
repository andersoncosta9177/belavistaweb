import React from "react";
import { Link } from "react-router-dom";
import { MdAssignment, MdDescription } from "react-icons/md";
import "../../../../../styles/stylesHome.css";

function HomeComunicados() {
  return (
    <div className="container-center">
      <div className="content-wrapper">
        <div className="buttons-grid">
          <Link 
            to="/sindico/comunicados/publicar-comunicado" 
            className="card-button"
          >
            <MdDescription style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Emitir</span>
          </Link>

          <Link 
            to="/sindico/comunicados/publicados" 
            className="card-button"
          >
            <MdAssignment style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Publicados</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomeComunicados;