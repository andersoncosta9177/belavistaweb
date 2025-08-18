  
  const getGreeting = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false, // Usa formato 24 horas
    });
  
    const currentHour = parseInt(formatter.format(new Date()), 10); // Converte para número
  
    if (currentHour < 12) {
      return 'Bom dia';
    } else if (currentHour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };
  export  default getGreeting