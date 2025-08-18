import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "@rneui/base";
import { Link } from "expo-router";
import GradientLayout from "../../../../../../src/Utils/gradiente";

function HomeNormas() {
    return (
     <GradientLayout style={styles.container}>
 
       <View style={styles.contentContainer}>
         <View style={styles.buttonContainer}>
           <Link href="/src/pages/sindico/pages/normas/publicar" asChild>
             <TouchableOpacity style={styles.button}>
               <Icon
                 name="file-edit"
                 type="material-community"
                 size={40}
                 color="#EFF3EA"
               />
               <Text style={styles.buttonText}>Emitir</Text>
             </TouchableOpacity>
           </Link>
 
           <Link href="/src/pages/sindico/pages/normas/normasPublicadas" asChild>
             <TouchableOpacity style={styles.button}>
               <Icon
                 name="file-check"
                 type="material-community"
                 size={40}
                 color="#EFF3EA"
               />
               <Text style={styles.buttonText}>Publicados</Text>
             </TouchableOpacity>
           </Link>
         </View>
       </View>
     </GradientLayout>
   );
 }
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
   },
   contentContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     width: '100%',
   },
   buttonContainer: {
     flexDirection: 'row',
     justifyContent: 'space-evenly',
     alignItems: 'center',
     width: '100%',
     paddingHorizontal: 20,
   },
   button: {
     width: '35%',
     aspectRatio: 1,
     justifyContent: 'center',
     alignItems: 'center',
     borderWidth: 1,
     borderColor: '#EFF3EA',
     borderRadius: 12,
     padding: 15,
     margin: 10,
     backgroundColor: 'rgba(255, 255, 255, 0.1)',
   },
   buttonText: {
     marginTop: 10,
     fontSize: 14,
     fontWeight: '600',
     color: '#EFF3EA',
     textAlign: 'center',
   },
 });

export default HomeNormas;