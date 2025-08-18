import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  Clipboard,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { Text, Card, Divider, Icon, Badge } from '@rneui/themed';
import GradientLayout from '../../../../../src/Utils/gradiente';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../../database/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

function ContatosScreen() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const CONTATOS_COLLECTION = 'DadosBelaVista/administracao/contatos';

  useEffect(() => {
    const contatosRef = ref(db, CONTATOS_COLLECTION);
    
    const unsubscribe = onValue(contatosRef, (snapshot) => {
      const data = snapshot.val();
      const contatosArray = [];
      
      if (data) {
        Object.keys(data).forEach(key => {
          contatosArray.push({
            id: key,
            ...data[key]
          });
        });
        
        contatosArray.sort((a, b) => a.nome.localeCompare(b.nome));
      }
      
      setContatos(contatosArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const copiarContato = (telefone) => {
    Clipboard.setString(telefone);
    Alert.alert(
      'Copiado!',
      'O telefone foi copiado para a área de transferência.',
      [{ text: 'OK' }]
    );
  };

  const ligarParaContato = (telefone) => {
    const numero = telefone.replace(/\D/g, '');
    Linking.openURL(`tel:${numero}`).catch(err => {
      Alert.alert('Erro', 'Não foi possível realizar a chamada');
      console.error('Erro ao chamar:', err);
    });
  };

  const enviarWhatsApp = (telefone) => {
    const numero = telefone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/55${numero}`).catch(err => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
      console.error('Erro ao abrir WhatsApp:', err);
    });
  };

  if (loading && contatos.length === 0) {
    return (
      <GradientLayout style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F98A1" />
          <Text style={styles.loadingText}>Carregando contatos...</Text>
        </View>
      </GradientLayout>
    );
  }

  return (
    <GradientLayout style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}> Contatos Importantes</Text>
        
        <Badge
          value={contatos.length}
          status="primary"
          badgeStyle={styles.badge}
          textStyle={styles.badgeText}
        />
      </View>

      {/* Lista de Contatos */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {contatos.length === 0 ? (
          <Card containerStyle={styles.emptyCard}>
            <Icon
              name="account-multiple"
              type="material-community"
              size={40}
              color="#0F98A1"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>Nenhum contato disponível</Text>
          </Card>
        ) : (
          contatos.map(contato => (
           
            <View key={contato.id}>
                <Card containerStyle={styles.contatoCard}>
                <View style={styles.contatoHeader}>
                  <View style={styles.contatoInfo}>
                    <Icon
                      name="account-circle"
                      type="material-community"
                      size={28}
                      color="#0F98A1"
                      style={styles.contatoIcon}
                    />
                    <View style={styles.contatoTextContainer}>
                      <Text style={styles.contatoNome}>{contato.nome}</Text>
                      <Text style={styles.contatoTelefone}>{formatarTelefone(contato.telefone)}</Text>
                    </View>
                  </View>
                </View>
                
                {contato.descricao && (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.descricaoContainer}>
                      <Icon
                        name="information-outline"
                        type="material-community"
                        size={18}
                        color="#0F98A1"
                        style={styles.descricaoIcon}
                      />
                      <Text style={styles.contatoDescricao}>{contato.descricao}</Text>
                    </View>
                  </>
                )}

                <Divider style={styles.divider} />

                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.callButton]}
                    onPress={() => ligarParaContato(contato.telefone)}
                  >
                    <Icon
                      name="phone"
                      type="material-community"
                      size={16}
                      color="#FFF"
                    />
                    <Text style={styles.actionButtonText}>Ligar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.whatsappButton]}
                    onPress={() => enviarWhatsApp(contato.telefone)}
                  >
                    <Icon
                      name="whatsapp"
                      type="material-community"
                      size={16}
                      color="#FFF"
                    />
                    <Text style={styles.actionButtonText}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.copyButton]}
                    onPress={() => copiarContato(contato.telefone)}
                  >
                    <Icon
                      name="content-copy"
                      type="material"
                      size={16}
                      color="#FFF"
                    />
                    <Text style={styles.actionButtonText}>Copiar</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          ))
        )}
      </ScrollView>
    </GradientLayout>
  );
}

const formatarTelefone = (telefone) => {
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  if (apenasNumeros.length === 10) {
    return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } 
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
    backgroundColor: 'rgba(15, 152, 161, 0.2)',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  title: {
    color: '#FFF',
    fontWeight: 'condensedBold',
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#0B1D51',
    height: 28,
    minWidth: 28,
    borderRadius: 14,
    borderWidth: 0,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  cardGradient: {
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 0,
    shadowColor: 'transparent',
   
  },
  contatoCard: {
     borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    paddingVertical: 10,
    overflow: "hidden",
    width: "96%",
    marginHorizontal: "2%",
  },
  contatoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  contatoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contatoIcon: {
    marginRight: 12,
  },
  contatoTextContainer: {
    flex: 1,
  },
  contatoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  contatoTelefone: {
    fontSize: 15,
    color: '#FFF',
    marginTop: 3,
    opacity: 0.9,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: 1,
  },
  descricaoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  descricaoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  contatoDescricao: {
    fontSize: 14,
    color: '#f5f5f5',
    opacity: 0.9,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 3,
  },
  callButton: {
    backgroundColor: '#0F98A1',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  copyButton: {
    backgroundColor: '#0B1D51',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  emptyCard: {
  borderRadius: 10,
    marginHorizontal: "2%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderWidth: 0,
    shadowColor: "transparent",
    elevation: 0,
    width: "96%",
    padding: 12,
    overflow: "hidden",
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    color: '#f5f5f5',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#f5f5f5',
    fontSize: 16,
  },
});

export default ContatosScreen;