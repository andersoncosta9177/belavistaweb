import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from './database/firebaseConfig';
import { motion } from 'framer-motion';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import '../src/styles/main.css'


function App() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodigo = async () => {
      try {
        const codigo = localStorage.getItem('codigo');
        if (codigo) {
          navigate('/portaria/home', { state: { codigo } });
        }
      } catch (error) {
        console.error('Erro ao buscar o código:', error);
      }
    };

    fetchCodigo();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const moradorRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${user.uid}`);
          const moradorSnapshot = await get(moradorRef);
  
          const sindicoRef = ref(db, `DadosBelaVista/usuarios/usuarioCondominio/${user.uid}`);
          const sindicoSnapshot = await get(sindicoRef);
  
          if (moradorSnapshot.exists()) {
            navigate('/moradores/home');
          } else if (sindicoSnapshot.exists()) {
            navigate('/sindico/home');
          } else {
            await signOut(auth);
            alert("Erro: Tipo de usuário não reconhecido.");
          }
        } catch (error) {
          console.error("Erro ao verificar tipo de usuário:", error);
          await signOut(auth);
          alert("Erro: Não foi possível verificar o tipo de usuário.");
        }
      } else {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="content-container">
        {/* Logo Centralizado */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="logo-container"
        >
          <img
            className="logo"
            src="/logo.png"
            alt="Logo do Condomínio"
          />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="welcome-title">Bem-vindo ao Sistema do Condomínio</h1>
          <p className="welcome-subtitle">Selecione seu tipo de acesso</p>
        </motion.div>

        {/* Botões de Acesso */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="buttons-container"
        >
          <button 
            onClick={() => navigate('/registro-condominio/login')}
            className="access-button"
          >
            <AdminPanelSettingsIcon className="button-icon" />
            <span className="button-text">Síndico</span>
          </button>

          <button 
            onClick={() => navigate('/registro-morador/login')}
            className="access-button"
          >
            <GroupsIcon className="button-icon" />
            <span className="button-text">Moradores</span>
          </button>

          <button 
            onClick={() => navigate('/registro-portaria/login')}
            className="access-button"
          >
            <SecurityIcon className="button-icon" />
            <span className="button-text">Portaria</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default App;