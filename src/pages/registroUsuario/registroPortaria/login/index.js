import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, child } from "firebase/database";
import { FaShieldAlt, FaKey, FaArrowLeft, FaSignInAlt } from "react-icons/fa";
import '../../../../styles/formularios.css'

export default function LoginUsuarioPortaria() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (codigo === "") {
      alert("Preencha o código de acesso.");
      return;
    }

    setLoading(true);

    try {
      const db = getDatabase();
      const dbRef = ref(db);

      const snapshot = await get(
        child(dbRef, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}`)
      );
      const snapshotNome = await get(
        child(dbRef, `DadosBelaVista/RegistroFuncionario/Tokens/${codigo}/nome`)
      );
      console.log(snapshotNome.val());

      if (!snapshot.exists()) {
        alert("Código de acesso inválido.");
        setLoading(false);
        return;
      }

  localStorage.setItem("codigo", codigo);
navigate(`/portaria/home/${codigo}`); // mantido igual ao App.js

    } catch (error) {
      console.error("Erro ao validar o código:", error);
      alert("Ocorreu um erro ao validar o código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <div className="form-container">
          <div className="header">
            <div className="icon-container">
              <FaShieldAlt className="icon" />
            </div>
            <h1 className="title">Login Portaria</h1>
          </div>

          {/* Campo de Código */}
          <div className="input-wrapper">
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                placeholder="Digite o código de acesso"
                value={codigo}
               type="number"
                onChange={(e) => setCodigo(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="button-container">
            <button 
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="button-icon" />
              Cancelar
            </button>
            
            <button
              className="login-button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Entrar
                  <FaSignInAlt className="button-icon" />
                </>
              )}
            </button>
          </div>

          {/* Texto do Rodapé */}
          <p style={{ textAlign: "center", marginTop: "20px", color: "white" }}>
            O código de acesso é fornecido pela administração do condomínio
          </p>
        </div>
      </div>
  );
}