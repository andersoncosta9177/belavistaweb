import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../../database/firebaseConfig';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSignInAlt } from 'react-icons/fa';
import '../../../../styles/formularios.css'

export default function LoginUsuarioMorador() {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const errosTemp = validarCampos();
    if (Object.keys(errosTemp).length > 0) {
      setErros(errosTemp);
      return;
    }

    setLoading(true);
    try {
      console.log('Tentando login com:', { 
        email: email.trim(), 
        senha: senha.trim(),
        auth: auth
      });
      
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), senha.trim());
      console.log('Login bem-sucedido:', userCredential.user);
      
      alert('Login realizado com sucesso!');
      navigate('/moradores/home');
    } catch (error) {
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      let mensagemErro = '';
      switch (error.code) {
        case 'auth/user-not-found': 
          mensagemErro = 'Usuário não encontrado.'; 
          break;
        case 'auth/wrong-password': 
          mensagemErro = 'Senha incorreta.'; 
          break;
        case 'auth/invalid-email': 
          mensagemErro = 'O e-mail informado não é válido.'; 
          break;
        default: 
          mensagemErro = `Erro ao fazer login: ${error.message}`;
      }
      alert(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="container">
        <form onSubmit={handleLogin} className="form-container">
          <div className="header">
            <div className="icon-container">
              <FaUser className="icon" />
            </div>
            <h1 className="title">Login Morador</h1>
          </div>

          {/* Email Input */}
          <div className="input-wrapper">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                autoComplete="email"
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
                required
                minLength="6"
                autoComplete='current-password'
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {erros.senha && <span className="error-text">{erros.senha}</span>}
          </div>

          {/* Buttons */}
          <div className="button-container">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="button-icon" />
              Cancelar
            </button>
            
            <button
              type="submit"
              className="login-button"
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

          {/* Links */}
          <div className="link-container">
            <span className="register-text">Não possui cadastro? </span>
            <Link to='/registro-morador/cadastro' className="link-text">
              Cadastre-se
            </Link>
          </div>
          <div className="link-container">
            <Link to='/registro-usuario/recuperar-senha' className="link-text">
              Esqueceu sua senha?
            </Link>
          </div>
        </form>
      </div>
  );
}