
import React from "react";
import { Link } from "react-router-dom";
import { 
  MdCheckCircle,
  MdInventory, 
  MdEdit
} from "react-icons/md";
import "../../../../styles/stylesHome.css";

function HomeEncomendas() {
  return (
    <div className="container-center">
      <div className="content-wrapper">
        <div className="buttons-grid">
          <Link 
            to="/portaria/encomendas/registro" 
            className="card-button"
          >
            <MdEdit style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Registro</span>
          </Link>

          <Link 
            to="/portaria/encomendas/pendentes" 
            className="card-button"
          >
            <MdInventory style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Pendentes</span>
          </Link>

    <Link 
  to="/portaria/encomendas/entregues" 
  className="card-button"
>
  <MdCheckCircle style={{ fontSize: 40, color: "#ED9121" }} /> 
  <span className="button-label">Entregues</span>
</Link>

        </div>
      </div>
    </div>
  );
}

export default HomeEncomendas;