import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../../../../src/database/firebaseConfig';
import { db } from '../../../../../src/database/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faFileAlt, 
  faEnvelope, 
  faPhone, 
  faIdCard, 
  faLock, 
  faEye, 
  faEyeSlash,
  faArrowLeft,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import '../../../../styles/formularios.css'


export default function CadastroCondominio() {
  const navigate = useNavigate();
  const [nomeCondominio, setNomeCondominio] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const gerarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g,'');
    
    if(cnpj.length !== 14) return false;
    
    // Validação do primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0,tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Validação do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
  };

  const validarCampos = () => {
    const errosTemp = {};
    const dominioPermitido = "residencialbelavista.df@gmail.com"; 
    
    if (!nomeCondominio.trim()) errosTemp.nomeCondominio = 'Nome do condomínio é obrigatório';
    
    if (!email.trim()) {
      errosTemp.email = 'Email é obrigatório';
    } else if (!email.endsWith(dominioPermitido)) {
      errosTemp.email = `Email não permitido para cadastro`;
    }
    
    if (!telefone.trim()) errosTemp.telefone = 'Telefone é obrigatório';
    
    if (!cnpj.trim()) errosTemp.cnpj = 'CNPJ é obrigatório';
    else if (!validarCNPJ(cnpj)) errosTemp.cnpj = 'CNPJ inválido';
    
    if (!senha.trim() || senha.length < 6) errosTemp.senha = 'A senha deve ter pelo menos 6 caracteres';
    
    if (senha !== confirmaSenha) errosTemp.confirmaSenha = 'As senhas não coincidem';
    
    return errosTemp;
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    const errosTemp = validarCampos();
    if (Object.keys(errosTemp).length > 0) {
      setErros(errosTemp);
      return;
    }

    setLoading(true);
    setErros({});

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const userRef = ref(db, `DadosBelaVista/usuarios/usuarioCondominio/${user.uid}`);
      await set(userRef, {
        nome: nomeCondominio.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        cnpj: cnpj.trim(),
        codigoMorador: gerarCodigo(),
      });

      navigate('/registro-usuario/registro-condominio/login');
    
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      let mensagemErro = '';
      switch (error.code) {
        case 'auth/email-already-in-use': mensagemErro = 'O e-mail já está em uso.'; break;
        case 'auth/invalid-email': mensagemErro = 'O e-mail informado não é válido.'; break;
        case 'auth/weak-password': mensagemErro = 'A senha deve ter pelo menos 6 caracteres.'; break;
        default: mensagemErro = 'Erro ao cadastrar usuário. Tente novamente.';
      }
      alert('Erro: ' + mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-background">
      <div className="container">
        <form className="form-container" onSubmit={handleCadastro}>
          <div className="header">
            <div className="icon-container">
              <FontAwesomeIcon icon={faBuilding} className="icon" />
            </div>
            <h2 className="title">Cadastro de Condomínio</h2>
          </div>

          {/* Nome do Condomínio */}
          <div className="input-wrapper">
            <div className="input-group">
              <span className="input-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </span>
              <input
                type="text"
                placeholder="Nome do Condomínio"
                value={nomeCondominio}
                onChange={(e) => setNomeCondominio(e.target.value)}
                className="input-field"
                autoCapitalize="words"
              />
            </div>
            {erros.nomeCondominio && <span className="error">{erros.nomeCondominio}</span>}
          </div>

          {/* Email */}
          <div className="input-wrapper">
            <div className="input-group">
              <span className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                autoCapitalize="none"
              />
            </div>
            {erros.email && <span className="error">{erros.email}</span>}
          </div>

          {/* Telefone */}
          <div className="input-wrapper">
            <div className="input-group">
              <span className="input-icon">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <input
                type="tel"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="input-field"
              />
            </div>
            {erros.telefone && <span className="error">{erros.telefone}</span>}
          </div>

          {/* CNPJ */}
          <div className="input-wrapper">
            <div className="input-group">
              <span className="input-icon">
                <FontAwesomeIcon icon={faIdCard} />
              </span>
              <input
                type="text"
                placeholder="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="input-field"
              />
            </div>
            {erros.cnpj && <span className="error">{erros.cnpj}</span>}
          </div>

          {/* Senha */}
          <div className="input-wrapper">
            <div className="input-group">
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha (mínimo 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {erros.senha && <span className="error">{erros.senha}</span>}
          </div>

          {/* Confirmar Senha */}
          <div className="input-wrapper">
            <div className="input-group">
              <span className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua Senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                className="input-field"
              />
              <span 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </span>
            </div>
            {erros.confirmaSenha && <span className="error">{erros.confirmaSenha}</span>}
          </div>

          {/* Botões */}
          <div className="button-container">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="button-icon" />
              Cancelar
            </button>
            
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  Cadastrar
                  <FontAwesomeIcon icon={faUserPlus} className="button-icon" />
                </>
              )}
            </button>
          </div>

          {/* Link para Login */}
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
        </form>
      </div>
    </div>
  );
}