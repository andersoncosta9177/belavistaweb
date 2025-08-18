import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../../../../database/firebaseConfig";
import { remove, ref, onValue } from "firebase/database";
import { formatDateOnly } from '../../../../../Utils/hourBrazil';
import { 
  MdEmail,
  MdOutlineEmail,
  MdExpandMore,
  MdExpandLess,
  MdPerson,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineAnnouncement,
  MdNewspaper
} from "react-icons/md";
import "./publicados.css";

const ComunicadoPublicado = () => {
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const comunicadosRef = ref(db, "DadosBelaVista/administracao/comunicados");

    const unsubscribe = onValue(comunicadosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const comunicadosArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        }));
        comunicadosArray.sort((a, b) => new Date(b.data) - new Date(a.data));
        setComunicados(comunicadosArray);
      } else {
        setComunicados([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const editarComunicado = (item, e) => {
    e.stopPropagation();
    navigate("/src/pages/sindico/pages/comunicados/editarComunicado", {
      state: {
        id: item.id,
        titulo: item.titulo,
        comunicado: item.comunicado,
        nomeSindico: item.nomeSindico,
      }
    });
  };

  const deletarComunicado = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este comunicado?")) {
      try {
        const comunicadoRef = ref(db, `DadosBelaVista/administracao/comunicados/${id}`);
        remove(comunicadoRef);
      } catch (error) {
        alert("Não foi possível excluir o comunicado.");
        console.error("Erro ao excluir comunicado:", error);
      }
    }
  };

  return (
    <div className="comunicados-publicados-container">
      <div className="scroll-container">
        <div className="header">
          <div className="header-icon">
            <MdOutlineAnnouncement size={28} color="#FFF" />
          </div>
          <h1 className="header-title">Comunicados Publicados</h1>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : comunicados.length === 0 ? (
          <div className="empty-container">
            <MdNewspaper size={60} color="rgba(255,255,255,0.7)" />
            <p className="empty-text">Nenhum comunicado encontrado</p>
          </div>
        ) : (
          comunicados.map((item) => (
            <div 
              key={item.id}
              className="card"
              onClick={() => toggleExpand(item.id)}
            >
              <div className="card-header">
                <div className="card-icon">
                  {expandedId === item.id ? (
                    <MdEmail size={20} color="#2c3e50" />
                  ) : (
                    <MdOutlineEmail size={20} color="#2c3e50" />
                  )}
                </div>
                <div className="card-header-content">
                  <h3 className="card-title">{item.titulo}</h3>
                  <p className="card-date">{formatDateOnly(item.data)}</p>
                </div>
                {expandedId === item.id ? (
                  <MdExpandLess size={24} color="#2c3e50" />
                ) : (
                  <MdExpandMore size={24} color="#2c3e50" />
                )}
              </div>
              
              {expandedId === item.id && (
                <div className="expanded-content">
                  <div className="card-content-container">
                    <p className="card-content">{item.comunicado}</p>
                  </div>
                  
                  <div className="card-footer">
                    <div className="author-container">
                      <MdPerson size={16} color="#2c3e50" style={{ marginRight: 8 }} />
                      <div>
                        <p className="card-author">{item.nomeSindico}</p>
                        <p className="card-role">Síndico(a)</p>
                      </div>
                    </div>
                    
                    <div className="actions">
                      <button 
                        className="action-button edit-button" 
                        onClick={(e) => editarComunicado(item, e)}
                      >
                        <MdOutlineEdit size={16} color="#FFF" />
                      </button>
                      <button 
                        className="action-button delete-button" 
                        onClick={(e) => deletarComunicado(item.id, e)}
                      >
                        <MdOutlineDelete size={16} color="#FFF" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComunicadoPublicado;