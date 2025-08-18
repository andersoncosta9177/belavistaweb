import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaKey, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaUserPlus } from 'react-icons/fa';
import '../../../../styles/formularios.css'

export default function CadastroMorador() {
  const navigate = useNavigate();
  
  // Refs para os inputs
  const emailRef = useRef();
  const telefoneRef = useRef();
  const apartamentoRef = useRef();
  const codigoAcessoRef = useRef();
  const senhaRef = useRef();
  const confirmaSenhaRef = useRef();

  // States
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erros, setErros] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validarCampos = () => {
    const errosTemp = {};
    if (!nome.trim()) errosTemp.nome = 'O nome é obrigatório';
    if (!email.trim()) errosTemp.email = 'O e-mail é obrigatório';
    if (!telefone.trim()) errosTemp.telefone = 'O telefone é obrigatório';
    if (!apartamento.trim()) errosTemp.apartamento = 'O apartamento é obrigatório';
    if (!codigoAcesso.trim()) errosTemp.codigoAcesso = 'O código de acesso é obrigatório';
    if (!senha.trim()) errosTemp.senha = 'A senha é obrigatória';
    if (senha !== confirmaSenha) errosTemp.confirmaSenha = 'As senhas não coincidem';
    return errosTemp;
  };

  const handleCadastro = async () => {
    const errosTemp = validarCampos();
    if (Object.keys(errosTemp).length > 0) {
      setErros(errosTemp);
      return;
    }
  
    try {
      setLoading(true);
      const db = getDatabase();
      
      // 1. Verificação do código de acesso
      const codigosRef = ref(db, 'DadosBelaVista/usuarios/usuarioCondominio');
      const snapshot = await get(codigosRef);
      
      if (!snapshot.exists()) {
        alert('Nenhum administrador cadastrado no sistema');
        setLoading(false);
        return;
      }
  
      // Busca pelo código nos usuários condomínio
      const usuariosCondominio = snapshot.val();
      const codigoEncontrado = Object.values(usuariosCondominio).some(
        usuario => usuario.codigoMorador?.toString() === codigoAcesso.toString()
      );
  
      if (!codigoEncontrado) {
        alert('Código de acesso inválido');
        setLoading(false);
        return;
      }
  
      // 2. Criação do usuário
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;
  
      // 3. Salvamento dos dados
      await set(ref(db, `DadosBelaVista/usuarios/usuarioMorador/${userId}`), {
        nome,
        email,
        telefone,
        apartamento,
        codigoAcesso,
        dataCadastro: new Date().toISOString(),
        tipoUsuario: 'morador'
      });
  
      // 4. Sucesso - redireciona somente após confirmação
      alert('Cadastro realizado!');
      navigate('/registro-usuario/registro-morador/login');
  
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      let errorMessage;
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'E-mail já cadastrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'E-mail inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha fraca (mínimo 6 caracteres)';
          break;
        default:
          errorMessage = 'Erro ao cadastrar. Tente novamente.';
      }
  
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-background">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container"
      >
        <div className="form-container">
          <div className="header">
            <div className="icon-container">
              <FaUser className="icon" />
            </div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="title"
            >
              Cadastro de Morador
            </motion.h1>
          </div>

          {/* Nome Completo */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && emailRef.current.focus()}
              />
            </div>
            {erros.nome && <span className="error-text">{erros.nome}</span>}
          </motion.div>

          {/* Email */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                ref={emailRef}
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && telefoneRef.current.focus()}
              />
            </div>
            {erros.email && <span className="error-text">{erros.email}</span>}
          </motion.div>

          {/* Telefone */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input
                ref={telefoneRef}
                type="tel"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && apartamentoRef.current.focus()}
              />
            </div>
            {erros.telefone && <span className="error-text">{erros.telefone}</span>}
          </motion.div>

          {/* Apartamento */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaHome className="input-icon" />
              <input
                ref={apartamentoRef}
                type="text"
                placeholder="Número do apartamento"
                value={apartamento}
                onChange={(e) => setApartamento(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && codigoAcessoRef.current.focus()}
              />
            </div>
            {erros.apartamento && <span className="error-text">{erros.apartamento}</span>}
          </motion.div>

          {/* Código de Acesso */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaKey className="input-icon" />
              <input
                ref={codigoAcessoRef}
                type="text"
                placeholder="Código de acesso"
                value={codigoAcesso}
                onChange={(e) => setCodigoAcesso(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && senhaRef.current.focus()}
              />
            </div>
            {erros.codigoAcesso && <span className="error-text">{erros.codigoAcesso}</span>}
          </motion.div>

          {/* Senha */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                ref={senhaRef}
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && confirmaSenhaRef.current.focus()}
              />
              <button 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {erros.senha && <span className="error-text">{erros.senha}</span>}
          </motion.div>

          {/* Confirmar Senha */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="input-wrapper"
          >
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                ref={confirmaSenhaRef}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === 'Enter' && handleCadastro()}
              />
              <button 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {erros.confirmaSenha && <span className="error-text">{erros.confirmaSenha}</span>}
          </motion.div>

          {/* Botões */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="button-container"
          >
            <button
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="button-icon" />
              Cancelar
            </button>
            
            <button
              className="login-button"
              onClick={handleCadastro}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Cadastrar
                  <FaUserPlus className="button-icon" />
                </>
              )}
            </button>
          </motion.div>

          {/* Link para Login */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="link-container"
          >
            <span className="register-text">Já possui cadastro? </span>
            <Link to="/registro-morador/login" className="link-text">
              Faça login
            </Link>
          </motion.div>
        </div>
      </motion.div>
       
    </div>
  );
}