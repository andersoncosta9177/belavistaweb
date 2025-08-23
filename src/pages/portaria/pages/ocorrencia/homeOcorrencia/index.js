// import React from "react";
// import { Link } from "react-router-dom";
// import { 
//   MdCreate, 
//   MdNotifications 
// } from "react-icons/md";
// import "../../../../../styles/stylesHome.css";

// function Alertas() {
//   return (
//     <div className="container-center">
//       <div className="content-wrapper">
//         <div className="buttons-list">
//           <Link 
//             to="/src/pages/portaria/pages/alertas/registrar" 
//             className="list-button"
//           >
//             <MdCreate className="button-icon" />
//             <span className="button-label">Registrar</span>
//           </Link>

//           <Link 
//             to="/src/pages/portaria/pages/alertas/alertasEnviados" 
//             className="list-button"
//           >
//             <MdNotifications className="button-icon" />
//             <span className="button-label">Alertas</span>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Alertas;


import React from "react";
import { Link } from "react-router-dom";
import { 
  MdDescription,
  MdNotifications,
  MdCreate
} from "react-icons/md";
import "../../../../../styles/stylesHome.css";

function Ocorrencias() {
  return (
    <div className="container-center">
      <div className="content-wrapper">
        <div className="buttons-grid">
          <Link 
            to="/src/pages/portaria/pages/ocorrencia/registroOcorrencia" 
            className="card-button"
          >
         <MdCreate style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Registrar</span>
          </Link>

          <Link 
            to="/src/pages/portaria/pages/ocorrencia/visualizacaoOcorrencia" 
            className="card-button"
          >
            <MdDescription style={{ fontSize: 40, color: "#ED9121" }} />
            <span className="button-label">Visualizar</span>
          </Link>

 
        </div>
      </div>
    </div>
  );
}

export default Ocorrencias;