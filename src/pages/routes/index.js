// src/Routes.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../../App';
import LoginCondominio from '../registroUsuario/registroCondominio/login';
import CadastroCondominio from '../registroUsuario/registroCondominio/cadastro';
import HomeComunicados from '../sindico/pages/comunicados/comunicadosHome';
import PublicarComunicado from '../sindico/pages/comunicados/publicarComunicado';
import ComicadosPublicados from '../sindico/pages/comunicados/publicados';

import LoginMorador from '../registroUsuario/registroMorador/login';
import CadastroMorador from '../registroUsuario/registroMorador/cadastro';
import LoginPortaria from '../registroUsuario/registroPortaria/login';
import HomeMorador from '../moradores/home';
import HomeSindico from '../sindico/home';
import HomePortaria from '../portaria/home';
import RecuperarSenha from '../registroUsuario/recuperarSenha';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro-condominio/login" element={<LoginCondominio />} />
        <Route path="/registro-usuario/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/sindico/comunicados/comunicados-home" element={<HomeComunicados />} />
        <Route path="/sindico/comunicados/publicados" element={<ComicadosPublicados />} />
        <Route path="/sindico/comunicados/publicar-comunicado" element={<PublicarComunicado />} />
        <Route path="/registro-morador/cadastro" element={<CadastroMorador />} />
        <Route path="/registro-usuario/registro-condominio/cadastro" element={<CadastroCondominio />} />
        <Route path="/registro-morador/login" element={<LoginMorador />} />
        <Route path="/registro-portaria/login" element={<LoginPortaria />} />
        <Route path="/moradores/home" element={<HomeMorador />} />
        <Route path="/sindico/home" element={<HomeSindico />} />
       <Route path="/portaria/home/:codigo" element={<HomePortaria />} />

      </Routes>
    </Router>
  );
}

export default AppRoutes;