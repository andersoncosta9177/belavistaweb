// src/Routes.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../../App';
import LoginCondominio from '../registroUsuario/registroCondominio/login';
import CadastroCondominio from '../registroUsuario/registroCondominio/cadastro';
import HomeComunicados from '../sindico/pages/comunicados/comunicadosHome';
import PublicarComunicado from '../sindico/pages/comunicados/publicarComunicado';
import ComicadosPublicados from '../sindico/pages/comunicados/publicados';
import AgendaSindico from '../sindico/pages/agenda/agendaHome';
import AgendaPortaria from '../portaria/pages/agenda/agendaHome';
import LoginMorador from '../registroUsuario/registroMorador/login';
import CadastroMorador from '../registroUsuario/registroMorador/cadastro';
import EventosAgendados from '../sindico/pages/agenda/agendados';
import Encomendas from '../portaria/pages/encomendas/index';
import Alertas from '../portaria/pages/alertas/alertaHome';
import EventosRealizdos from '../portaria/pages/agenda/realizados';
import LoginPortaria from '../registroUsuario/registroPortaria/login';
import HomeMorador from '../moradores/home';
import HomeSindico from '../sindico/home';
import Manutencao from '../portaria/pages/manutencao'
import HomePortaria from '../portaria/home';
import RecuperarSenha from '../registroUsuario/recuperarSenha';
import Normas from '../portaria/pages/normas';
import OcorrenciaPortaria from '../portaria/pages/ocorrencia/homeOcorrencia';
import MoradoresInfo from '../portaria/pages/moradoresInfo';
import ContatosScreenPortaria from '../portaria/pages/contatos';
import ComunicadoPublicadoPortaria from '../portaria/pages/comunicados';
import VisitantesPortaria from '../portaria/pages/visitantes';
import ObjetosPerdidos from '../portaria/pages/objetosPerdidos/HomeItensPerdidos';
import GaragemPortaria from '../portaria/pages/garagem';
import Colaboradores from '../portaria/pages/colaboradores';
import PrestadoresServicos from '../moradores/pages/prestadoresServicos';
import RegistroEncomendas from '../portaria/pages/encomendas/registro/registro';
import EncomendasPendentes from '../portaria/pages/encomendas/pendentes';
import EncomendasEntregues from '../portaria/pages/encomendas/entregues';
import AgendamentoPortaria from '../portaria/pages/agenda/agendamento';
import AgendadosPortaria from '../portaria/pages/agenda/agendado';
import EventosRealizadosPortaria from '../portaria/pages/agenda/realizados';  
import RelatorioEventos from '../portaria/pages/agenda/relatorio';
import Termos from '../portaria/pages/agenda/termos';
import Convidados   from '../moradores/pages/agenda/convidados';
import HomeDocumentos from '../portaria/pages/documentos/HomeDocumentos';
import RegistroDoc from '../portaria/pages/documentos/registroDoc';
import DocumentosRegistrados from '../portaria/pages/documentos/documentosRegistrados';
function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/registro-condominio/login" element={<LoginCondominio />} />
        <Route path="/registro-usuario/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/sindico/comunicados/comunicados-home" element={<HomeComunicados />} />
        <Route path="/sindico/agenda/agenda-home" element={<AgendaSindico />} />    
        <Route path="/portaria/documentos/home-documentos" element={<HomeDocumentos />} /> 
         
        <Route path="/portaria/documentos/registro-doc" element={<RegistroDoc />} /> 
        <Route path="/portaria/documentos/documentos-registrados" element={<DocumentosRegistrados />} />

        <Route path="/portaria/visitantes" element={<VisitantesPortaria/>} />
         <Route path='/portaria/agenda/relatorio' element={<RelatorioEventos/>} />
        <Route path='/portaria/agenda/termos' element={<Termos/>} />

         <Route path='/moradores/agenda/convidados' element={<Convidados/>} />
        <Route path="/moradores/prestadores-servicos" element={<PrestadoresServicos />} />
        <Route path="/portaria/encomendas/registro" element={<RegistroEncomendas />} />
        <Route path="/portaria/agenda/agendamento" element={<AgendamentoPortaria />} />
        <Route path="/portaria/agenda/agendado" element={<AgendadosPortaria />} />
        <Route path="/portaria/agenda/realizados" element={<EventosRealizadosPortaria />} />
        <Route path="/portaria/colaboradores" element={<Colaboradores />} />
        <Route path="/portaria/garagem" element={<GaragemPortaria />} />
        <Route path="/portaria/encomendas/pendentes" element={<EncomendasPendentes />} />
        <Route path="/portaria/encomendas/entregues" element={<EncomendasEntregues />} />
        <Route path="/portaria/contatos" element={<ContatosScreenPortaria />} />
        <Route path="/portaria/comunicados" element={<ComunicadoPublicadoPortaria />} />
        <Route path="/portaria/moradores-info" element={<MoradoresInfo />} />
        <Route path="/portaria/ocorrencia/home-ocorrencia" element={<OcorrenciaPortaria />} />
        <Route path="/portaria/objetos-perdidos" element={<ObjetosPerdidos />} />
        <Route path="/portaria/normas" element={<Normas />} />
        <Route path="/portaria/manutencao" element={<Manutencao />} />
        <Route path="/portaria/encomendas/index.js" element={<Encomendas />} />
        <Route path="/portaria/alertas/alertas-home" element={<Alertas />} />
        <Route path="/portaria/agenda/agenda-home" element={<AgendaPortaria />} />
        <Route path="/portaria/pages/agenda/realizados" element={<EventosRealizdos />} />
        <Route path="/sindico/pages/agenda/agendados" element={<EventosAgendados />} />
        <Route path="/sindico/comunicados/publicados" element={<ComicadosPublicados />} />
        <Route path="/sindico/comunicados/publicar-comunicado" element={<PublicarComunicado />} />
        <Route path="/registro-morador/cadastro" element={<CadastroMorador />} />
        <Route path="/registro-usuario/registro-condominio/cadastro" element={<CadastroCondominio />} />
        <Route path="/registro-usuario/registro-condominio/login" element={<LoginCondominio />} />
        <Route path="/registro-morador/login" element={<LoginMorador />} />
        <Route path="/registro-portaria/login" element={<LoginPortaria />} />
        <Route path="/moradores/home" element={<HomeMorador />} />
        <Route path="/sindico/home" element={<HomeSindico />} />
       <Route path="/portaria/home" element={<HomePortaria />} />

       <Route path="/portaria/home/:codigo" element={<HomePortaria />} />

      </Routes>
    </Router>
  );
}

export default AppRoutes;