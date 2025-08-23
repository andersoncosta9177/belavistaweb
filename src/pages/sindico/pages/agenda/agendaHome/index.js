import React from "react";
import { Link } from "react-router-dom";
import { 
  EventAvailable, 
  EventNote, 
  Assignment 
} from "@mui/icons-material";
import "../../../../../styles/stylesHome.css";

function AgendaHome() {
  return (
    <div className="container gradient-background">
   

      <div className="grid-container">
        <Link to="/sindico/agenda/agendados" className="grid-item">
          <EventNote fontSize="large" className="grid-icon" />
          <span className="grid-text">Agendados</span>
        </Link>

        <Link to="../../../../portaria/pages/agenda/realizados" className="grid-item">
          <EventAvailable fontSize="large" className="grid-icon" />
          <span className="grid-text">Realizados</span>
        </Link>

        <Link to="/portaria/agenda/relatorio" className="grid-item">
          <Assignment fontSize="large" className="grid-icon" />
          <span className="grid-text">Relatório</span>
        </Link>
      </div>
    </div>
  );
}

export default AgendaHome;