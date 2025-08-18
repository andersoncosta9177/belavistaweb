export const sendNotification = async (expoPushToken, title, body) => {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: "default",
          title: title,
          body: body,
        }),
      });
  
      const data = await response.json();
      console.log("Resposta do Expo:", data);
      return data;
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    }
  };
  