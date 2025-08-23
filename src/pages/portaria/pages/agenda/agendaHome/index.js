import React from "react";
import { Link } from "react-router-dom";
import { 
  MdEventAvailable, 
  MdEvent, 
  MdAssignment, 
  MdCheckCircle 
} from "react-icons/md";
import "../../../../../styles/stylesHome.css";

function AgendaHome() {
  return (
    <div className="container-center">
      <div className="content-wrapper">
        <div className="buttons-grid">
          <Link 
            to="/portaria/agenda/agendamento" 
            className="card-button"
          >
            <MdEventAvailable style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Agendar</span>
          </Link>

          <Link 
            to="/portaria/agenda/agendado" 
            className="card-button"
          >
            <MdEvent style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Agendados</span>
          </Link>

          <Link 
            to="/portaria/agenda/relatorio" 
            className="card-button"
          >
            <MdAssignment style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Relatório</span>
          </Link>

          <Link 
            to="/portaria/agenda/realizados" 
            className="card-button"
          >
            <MdCheckCircle style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Realizados</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AgendaHome;