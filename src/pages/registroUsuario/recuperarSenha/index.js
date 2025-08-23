import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../database/firebaseConfig';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import '../../../../src/styles/formularios.css'
export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});

  const validarCampos = () => {
    const errosTemp = {};
    if (!email.trim()) errosTemp.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errosTemp.email = 'Email inválido';
    return errosTemp;
  };

  const handleRecuperarSenha = async () => {
    const errosTemp = validarCampos();
    if (Object.keys(errosTemp).length > 0) {
      setErros(errosTemp);
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert('Um link para redefinição de senha foi enviado para seu email. Verifique sua caixa de entrada.');
      navigate('/');
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      let mensagemErro = 'Erro ao enviar email de recuperação. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        mensagemErro = 'Nenhum usuário encontrado com este email.';
      }
      
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <div className="form-container">
          <div className="header">
            <div className="icon-container">
              <FaEnvelope className="icon" />
            </div>
            <h1 className="title">Recuperar Senha</h1>
          </div>

          {/* Email Input */}
          <div className="input-wrapper">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Digite seu email cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoCapitalize="none"
              />
            </div>
            {erros.email && <span className="error-text">{erros.email}</span>}
          </div>

          {/* Button */}
          <div className="button-container-single">
            <button
              className="login-button"
              onClick={handleRecuperarSenha}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Enviar Link
                  <FaPaperPlane className="button-icon" />
                </>
              )}
            </button>
          </div>

          {/* Back Link */}
          <div className="link-container">
            <Link to="/" className="link-text">
              <FaArrowLeft className="button-icon" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
  );
}