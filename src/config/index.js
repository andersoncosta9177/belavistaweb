// import React, { useState, useEffect } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { ref, onValue, remove } from "firebase/database";
// import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
// import { Card, Text, Divider } from "@rneui/themed";
// import Globalstyles from "../../../../GlobalStyles";
// import { db } from "../../../../../database/firebaseConfig";
// import FormateDate from "../../../../../../../components/formateDate";
// import { Link } from "expo-router";
// import GradientLayout from '../../../../../../../components/gradiente';

// const EventosAgendadosPortaria = () => {
//   const [loading, setLoading] = useState(true);
//   const [agendamento, setAgendamento] = useState([]);



//   useEffect(() => {
//     const agendamentosRef = ref(db, 'DadosBelaVista/DadosGerais/Reservas');
//     onValue(agendamentosRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const listaAgendamentos = Object.keys(data).map((key) => ({
//           id: key,
//           ...data[key],
//         }));
//         // Ordenar por data do evento
//         listaAgendamentos.sort((a, b) => new Date(a.data) - new Date(b.data));
//         setAgendamento(listaAgendamentos);
//       } else {
//         setAgendamento([]);
//       }
//       setLoading(false);
//     });
//   }, []);

//   if (loading) {
//     return (
//       <View style={Globalstyles.container}>
//         <ActivityIndicator size="large" color="#fff" />
//         <Text style={styles.loadingText}>Carregando agenda da portaria...</Text>
//       </View>
//     );
//   }

//   return (
//     <GradientLayout style={styles.container}>
//       <Text style={styles.title}>Agenda da Portaria</Text>
      
//       {agendamento.length > 0 ? (
//         agendamento.map((item) => (
//           <Card key={item.id} containerStyle={styles.card}>
//             <View style={styles.cardContent}>
//               <View style={styles.propertyRow}>
//                 <Text style={styles.propertyText}>Tipo de evento:</Text>
//                 <Text style={styles.valueText}>{item.tipo}</Text>
//               </View>
              
//               <View style={styles.propertyRow}>
//                 <Text style={styles.propertyText}>Morador:</Text>
//                 <Text style={styles.valueText}>{item.nome || 'Não informado'}</Text>
//               </View>
              
//               <View style={styles.propertyRow}>
//                 <Text style={styles.propertyText}>Apartamento:</Text>
//                 <Text style={styles.valueText}>{item.apartamento}</Text>
//               </View>
              
//               <View style={styles.propertyRow}>
//                 <Text style={styles.propertyText}>Data do evento:</Text>
//                 <Text style={styles.valueText}>{FormateDate(item.data)}</Text>
//               </View>
              
//               <View style={styles.propertyRow}>
//                 <Text style={styles.propertyText}>Total pessoas:</Text>
//                 <Text style={styles.valueText}>
//                   {item.totalPessoas || "Não informado"}
//                 </Text>
//               </View>

//               <Divider style={styles.divider} />
              
//               <View style={styles.actionsContainer}>
//                 <Link href={`/pages/portaria/pages/termos?id=${item.id}`} asChild>
//                   <TouchableOpacity style={styles.actionButton}>
//                     <MaterialCommunityIcons
//                       name="file-document"
//                       size={24}
//                       color="#EFF3EA"
//                     />
//                     <Text style={styles.actionText}>Termo</Text>
//                   </TouchableOpacity>
//                 </Link>
                
//                 <Link href={`/pages/portaria/pages/convidados?id=${item.id}`} asChild>
//                   <TouchableOpacity style={styles.actionButton}>
//                     <MaterialCommunityIcons
//                       name="account-group"
//                       size={24}
//                       color="#EFF3EA"
//                     />
//                     <Text style={styles.actionText}>Convidados</Text>
//                   </TouchableOpacity>
//                 </Link>
                
//                 <TouchableOpacity 
//                   style={styles.actionButton} 
//                   onPress={() => deleteEvento(item.id)}
//                 >
//                   <MaterialIcons name="delete" size={24} color="#FF3A30" />
//                   <Text style={[styles.actionText, { color: "#FF3A30" }]}>Excluir</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </Card>
//         ))
//       ) : (
//         <Text style={styles.emptyText}>Nenhum evento agendado encontrado.</Text>
//       )}
//     </GradientLayout>
//   );
// };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// //   title: {
// //     color: '#EFF3EA',
// //     marginBottom: 15,
// //     textAlign: 'center',
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //   },
// //   card: {
// //     borderRadius: 10,
// //     marginHorizontal: '2%',
// //     backgroundColor: 'rgba(0, 0, 0, 0.3)',
// //     borderWidth: 0,
// //     shadowColor: "transparent",
// //     elevation: 0,
// //     width: '96%',
// //     padding: 12,
// //     marginBottom: 10,
// //   },
// //   cardContent: {
// //     width: '100%',
// //     padding: 5,
// //   },
// //   propertyRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 8,
// //   },
// //   propertyText: {
// //     fontSize: 12,
// //     color: '#EFF3EA',
// //     fontWeight: 'bold',
// //   },
// //   valueText: {
// //     fontSize: 12,
// //     color: '#EFF3EA',
// //   },
// //   divider: {
// //     marginVertical: 10,
// //     backgroundColor: '#EFF3EA',
// //   },
// //   actionsContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-around',
// //     marginTop: 8,
// //   },
// //   actionButton: {
// //     alignItems: 'center',
// //     padding: 6,
// //   },
// //   actionText: {
// //     fontSize: 12,
// //     color: '#EFF3EA',
// //     marginTop: 4,
// //   },
// //   emptyText: {
// //     color: '#EFF3EA',
// //     textAlign: 'center',
// //     marginTop: 20,
// //     fontSize: 16,
// //   },
// //   loadingText: {
// //     color: '#EFF3EA',
// //     textAlign: 'center',
// //     marginTop: 10,
// //     fontSize: 16,
// //   },
// // });

// export default EventosAgendadosPortaria;