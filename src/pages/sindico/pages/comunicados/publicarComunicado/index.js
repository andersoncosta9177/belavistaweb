import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../../../database/firebaseConfig';
import { ref, push, set } from 'firebase/database';
import { 
  MdCampaign, 
  MdTitle, 
  MdNotes, 
  MdPerson, 
  MdCancel, 
  MdSave 
} from 'react-icons/md';
import './publicarComunicados.css';

const EmitirComunicado = () => {
  const [titulo, setTitulo] = useState("");
  const [comunicado, setComunicado] = useState("");
  const [nomeSindico, setNomeSindico] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [comunicadoId, setComunicadoId] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (params.id) {
      // Modo edição - You might need to fetch the data from your backend here
      setIsEditing(true);
      setComunicadoId(params.id);
      // In a real app, you would fetch the data from your API
      // For now, using placeholder values
      setTitulo(params.titulo || "");
      setComunicado(params.comunicado || "");
      setNomeSindico(params.nomeSindico || "");
    }
  }, [params]);

  async function salvarComunicado() {
    if (titulo === "" || comunicado === "" || nomeSindico === "") {
      alert("Atenção: Por favor, preencha todos os campos antes de enviar.");
      return;
    }

    setLoading(true);
    
    try {
      if (isEditing) {
        // Atualizar comunicado existente
        const comunicadoRef = ref(db, `DadosBelaVista/administracao/comunicados/${comunicadoId}`);
        await set(comunicadoRef, {
          titulo: titulo,
          comunicado: comunicado,
          nomeSindico: nomeSindico,
          data: new Date().toISOString(),
        });
      } else {
        // Criar novo comunicado
        const comunicadosRef = ref(db, 'DadosBelaVista/administracao/comunicados');
        await push(comunicadosRef, {
          titulo: titulo,
          comunicado: comunicado,
          nomeSindico: nomeSindico,
          data: new Date().toISOString(),
        });
      }

      alert(`Sucesso: Comunicado ${isEditing ? 'atualizado' : 'enviado'} com sucesso!`);
      navigate("/src/pages/sindico/pages/comunicados/publicados");
      
    } catch (error) {
      console.error(`Erro ao ${isEditing ? 'atualizar' : 'enviar'} comunicado:`, error);
      alert(`Erro: Não foi possível ${isEditing ? 'atualizar' : 'enviar'} o comunicado. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  }
// Adicione este efeito para autoajustar a altura

  return (
    <div>
      <div className="page-container">
        <div className="scroll-container">
          <div className="card">
            <div className="header">
              <MdCampaign size={24} className="icon" />
              <h2 className="title">
                {isEditing ? 'Editar Comunicado' : 'Emitir Comunicado'}
              </h2>
            </div>

            <div className="input-group">
              <MdTitle size={20} className="icon" />
              <input
                type="text"
                placeholder="Título do Comunicado"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="input-group textarea-group">
              <MdNotes size={20} className="icon" />
              <textarea
                placeholder="Conteúdo do Comunicado"
                value={comunicado}
                onChange={(e) => setComunicado(e.target.value)}
                rows={50}
                className="input-field textarea-field"
                aria-multiline
              />
            </div>

            <div className="input-group">
              <MdPerson size={20} className="icon" />
              <input
                type="text"
                placeholder="Seu Nome como Síndico"
                value={nomeSindico}
                onChange={(e) => setNomeSindico(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="button-container">
              <button 
                className="cancel-button"
                onClick={() => navigate(-1)}
              >
                <MdCancel size={16} className="button-icon" />
                Cancelar
              </button>
            
              <button
                onClick={salvarComunicado}
                disabled={loading}
                className={`submit-button ${loading ? 'disabled-button' : ''}`}
              >
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    <MdSave size={16} className="button-icon" />
                    {isEditing ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmitirComunicado;