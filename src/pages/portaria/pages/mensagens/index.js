import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, Text, Icon } from '@rneui/themed';
import { Chat } from '@flyerhq/react-native-chat-ui';
import { db } from '../../../../database/firebaseConfig';
import { ref, push, onValue, off } from 'firebase/database';
import { useLocalSearchParams } from 'expo-router';
import GradientLayout from '../../../../../src/Utils/gradiente';

const ChatScreen = () => {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [morador, setMorador] = useState(null);
  const user = { id: 'sindico' };

  // Buscar informações do morador
  useEffect(() => {
    const moradorRef = ref(db, `DadosBelaVista/usuarios/usuarioMorador/${id}`);
    onValue(moradorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMorador({
          id: id,
          nome: data.nome || 'Morador',
          avatar: data.fotoPerfil || null,
        });
      }
    });
    return () => off(moradorRef);
  }, [id]);

  // Buscar mensagens do chat
  useEffect(() => {
    const chatRef = ref(db, `DadosBelaVista/chats/${id}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedMessages = Object.keys(data).map(key => ({
          id: key,
          text: data[key].text,
          createdAt: data[key].createdAt,
          author: { id: data[key].author.id },
          type: 'text',
        }));
        setMessages(loadedMessages.sort((a, b) => Number(a.createdAt) - Number(b.createdAt)));
      }
    });
    return () => off(chatRef);
  }, [id]);

  const handleSendPress = useCallback((message) => {
    const newMessage = {
      id: Date.now().toString(),
      text: message.text,
      createdAt: new Date().getTime(),
      author: user,
      type: 'text',
    };
    push(ref(db, `DadosBelaVista/chats/${id}`), {
      text: newMessage.text,
      createdAt: newMessage.createdAt,
      author: { id: newMessage.author.id },
    });
  }, [id, user]);

  const renderMessageFooter = ({ message }) => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {message.author.id === user.id && (
        <Icon name="check" type="material-community" size={14} color="#4fc3f7" />
      )}
    </View>
  );

  return (
    <GradientLayout style={styles.container} scrollEnabled={false}>
      {/* Cabeçalho */}
      {morador && (
        <View style={styles.header}>
          <Avatar
            rounded
            size={40}
            source={morador.avatar ? { uri: morador.avatar } : null}
            icon={{ name: 'account', type: 'material-community' }}
            containerStyle={styles.avatar}
          />
          <Text style={styles.headerTitle}>{morador.nome}</Text>
        </View>
      )}

      {/* Área do Chat */}
      <View style={styles.chatOuterWrapper}>
        <Chat
          messages={messages}
          onSendPress={handleSendPress}
          user={user}
          renderMessageFooter={renderMessageFooter}
          textInputProps={{
            placeholder: 'Digite sua mensagem...',
            style: styles.input,
            multiline: true,
            placeholderTextColor: '#888',
          }}
          inputContainerStyle={styles.inputContainer}
          sendButtonProps={{ style: styles.sendButton }}
          bubbleStyles={{
            left: styles.leftBubble,
            right: styles.rightBubble,
          }}
          listViewProps={{
            style: styles.messageList,
            contentContainerStyle: styles.messageListContent,
          }}
          containerStyle={styles.chatContainer}
          inputWrapperStyle={styles.inputWrapper}
          style={styles.chatComponent}
          showUserAvatars={false}
        />
      </View>

      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
    </GradientLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  chatOuterWrapper: {
    flex: 1,
    backgroundColor: '#e5ddd5',
    overflow: 'hidden',
  },
  chatComponent: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  chatContainer: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  inputWrapper: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    paddingHorizontal: 16,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
    maxHeight: 100,
    flex: 1,
    marginRight: 8,
    color: '#333',
  },
  messageList: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  messageListContent: {
    backgroundColor: 'transparent',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatar: {
    marginRight: 10,
    backgroundColor: '#0F98A1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#0F98A1',
    borderRadius: 20,
    marginLeft: 8,
  },
  leftBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 0,
    marginRight: 60,
    padding: 8,
  },
  rightBubble: {
    backgroundColor: '#dcf8c6',
    borderBottomRightRadius: 0,
    marginLeft: 60,
    padding: 8,
  },
});

export default ChatScreen;