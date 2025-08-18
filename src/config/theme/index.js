import { createTheme } from '@rneui/themed';
import { StyleSheet } from 'react-native';

const theme = createTheme({
  // 1. Cores principais
  colors: {
    // Cores base
    primary: '#4CAF50',
    primaryLight: '#81C784',
    primaryDark: '#388E3C',
    secondary: '#FFC107',
    error: '#FF3B30',
    warning: '#F39C12',
    success: '#2ECC71',
    info: '#4CC9FE',
    purple: '#800080',
    blue: '#344CB7',
    
    // Cores de texto
    text: '#212121',
    textLight: '#767a7b',
    textWhite: '#FFFFFF',
    
    // Cores de fundo
    background: '#F5F5F5',
    backgroundDark: '#E3E7ED',
    cardBackground: '#FFFFFF',
    transparentWhite: 'rgba(255,255,255,0.9)',
    transparentBlack: 'rgba(0,0,0,0.3)',
    
    // Cores de borda
    border: '#E0E0E0',
    borderLight: '#EDE9D5',
    borderDark: '#754E1A',
    
    // Gradiente
    gradientStart: '#800080',
    gradientEnd: '#344CB7'
  },

  // 2. Componentes RNEUI customizados
  components: {
    Button: {
      buttonStyle: {
        borderRadius: 8,
      },
      titleStyle: {
        fontWeight: 'bold',
      },
      types: {
        primary: {
          buttonStyle: { backgroundColor: '#4CAF50' },
          titleStyle: { color: '#FFFFFF' }
        },
        secondary: {
          buttonStyle: { backgroundColor: '#FFC107' },
          titleStyle: { color: '#212121' }
        },
        cancel: {
          buttonStyle: { 
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#F39C12'
          },
          titleStyle: { color: '#F39C12' }
        },
        transparent: {
          buttonStyle: { 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
          titleStyle: { color: '#FFFFFF' }
        }
      }
    },
    Input: {
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#E0E0E0',
        paddingHorizontal: 10,
      },
      inputStyle: {
        color: '#767a7b',
        paddingLeft: 10,
      },
      labelStyle: {
        color: '#757575',
        marginBottom: 5,
      },
      errorStyle: {
        color: '#FF3B30',
      }
    },
    Card: {
      containerStyle: {
        borderRadius: 12,
        padding: 15,
        margin: 0,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }
    },
    Text: {
      h1: { fontSize: 24, fontWeight: 'bold', color: '#212121' },
      h2: { fontSize: 20, fontWeight: 'bold', color: '#212121' },
      h3: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
      body: { fontSize: 16, color: '#212121' },
      caption: { fontSize: 12, color: '#767a7b' },
      link: { fontSize: 13, color: '#4CC9FE', fontWeight: 'bold' },
      error: { color: '#FF3B30', fontSize: 12 }
    }
  },

  // 3. Estilos globais (substitui GlobalStyles)
  styles: StyleSheet.create({
    // Layout
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#F5F5F5'
    },
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 10
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    row: {
      flexDirection: 'row'
    },
    spaceBetween: {
      justifyContent: 'space-between'
    },
    
    // Cards
    card: {
      borderRadius: 10,
      padding: 15,
      backgroundColor: '#FFFFFF',
      marginVertical: 6,
      marginHorizontal: '3%',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    transparentCard: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 0,
      shadowColor: 'transparent',
      elevation: 0
    },
    
    // Formulários
    formContainer: {
      width: '96%',
      marginHorizontal: '2%',
      paddingVertical: 35,
      borderRadius: 15,
      backgroundColor: '#F4F6F9',
      marginTop: 20
    },
    inputContainer: {
      width: '94%',
      marginHorizontal: '3%',
      marginBottom: 20
    },
    
    // Botões
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20
    },
    iconButton: {
      width: '28%',
      aspectRatio: 1.2,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 12,
      padding: 8,
      marginTop: 10
    },
    
    // Cabeçalhos
    header: {
      alignItems: 'center',
      marginBottom: 15,
      paddingTop: 10
    },
    logoContainer: {
      width: '94%',
      alignItems: 'center',
      justifyContent: 'center',
      height: '25%',
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.9)',
      marginHorizontal: '3%'
    },
    
    // Textos
    welcomeText: {
      fontSize: 12,
      color: '#767a7b',
      marginLeft: 5
    },
    
    // Utilidades
    divider: {
      borderBottomWidth: 0.8,
      borderColor: '#E0E0E0',
      marginVertical: 10
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E3E7ED'
    }
  }),
  GradientLayout: {
    colors: ['#800080', '#344CB7'], // Cores do gradiente
    statusBar: {
      style: 'light-content',
      translucent: true,
      backgroundColor: '#800080'
    },
    styles: StyleSheet.create({
      gradient: {
        flex: 1,
      },
      container: {
        flex: 1,
      },
      contentContainer: {
        flexGrow: 1,
      }
    })
  }
});

// 4. Estilos específicos para o GradientLayout (mantido separado)


export default theme;