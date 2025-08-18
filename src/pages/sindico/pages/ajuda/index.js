// Crie um novo arquivo HelpScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HelpScreen = () => {
  const faqItems = [
    // Array de perguntas e respostas
  ];

  const handleContactPress = () => {
    Linking.openURL('mailto:sindico@condominiobelavista.com');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Central de Ajuda</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Rápido</Text>
        <Text style={styles.text}>
          Aqui você encontra instruções básicas para usar o aplicativo...
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suporte</Text>
        <TouchableOpacity 
          style={styles.contactButton} 
          onPress={handleContactPress}
        >
          <MaterialCommunityIcons name="email" size={24} color="#FFFFFF" />
          <Text style={styles.contactText}>Enviar e-mail para suporte</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0F98A1',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  faqItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  question: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333333',
    marginBottom: 5,
  },
  answer: {
    fontSize: 14,
    color: '#555555',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F98A1',
    padding: 15,
    borderRadius: 8,
  },
  contactText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default HelpScreen;