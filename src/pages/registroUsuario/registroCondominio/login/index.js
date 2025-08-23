import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../../src/database/firebaseConfig';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSignInAlt } from 'react-icons/fa';
import '../../../../styles/formularios.css'

export default function LoginUsuarioCondominio() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validarCampos = () => {
    const errosTemp = {};
    if (!email.trim()) errosTemp.email = 'Email é obrigatório';
    if (!senha.trim() || senha.length < 6) errosTemp.senha = 'A senha deve ter pelo menos 6 caracteres';
    return errosTemp;
  };

  const handleLogin = async () => {
    const errosTemp = validarCampos();
    if (Object.keys(errosTemp).length > 0) {
      setErros(errosTemp);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha.trim());
      window.location.href = '/sindico/home';
    } catch (error) {
      let mensagemErro = '';
      switch (error.code) {
        case 'auth/user-not-found': mensagemErro = 'Usuário não encontrado.'; break;
        case 'auth/wrong-password': mensagemErro = 'Senha incorreta.'; break;
        case 'auth/invalid-email': mensagemErro = 'O e-mail informado não é válido.'; break;
        default: mensagemErro = 'Erro ao fazer login. Tente novamente.';
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
              <FaUser className="icon" />
            </div>
            <h1 className="title">Login Síndico</h1>
          </div>

          {/* Email Input */}
          <div className="input-wrapper">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="E-mail do condomínio"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
            {erros.email && <span className="error-text">{erros.email}</span>}
          </div>

          {/* Password Input */}
          <div className="input-wrapper">
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
              />
              <button 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {erros.senha && <span className="error-text">{erros.senha}</span>}
          </div>

          {/* Buttons */}
       <div className="button-container">
  <button
    className="cancel-button"
    onClick={() => navigate(-1)}
    type="button" 
  >
    <FaArrowLeft className="button-icon" />
    Cancelar
  </button>
  
  <button
    className="login-button"
    onClick={handleLogin}
    disabled={loading}
    type="button" 
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

          {/* Links */}
          <div className="link-container">
            <span className="register-text">Não possui cadastro? </span>
            <Link to='/registro-usuario/registro-condominio/cadastro' className="link-text">
              Cadastre-se
            </Link>
          </div>
          <div className="link-container">
            <Link to='/registro-usuario/recuperar-senha' className="link-text">
              Esqueceu sua senha?
            </Link>
         
          </div>
        </div>
      </div>
  );
}