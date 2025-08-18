const FormateDate = (dateInput) => {
  // Caso o input seja null/undefined
  if (!dateInput) return "Data não informada";
  
  // Se já for um objeto Date
  if (dateInput instanceof Date) {
    return dateInput.toLocaleDateString('pt-BR');
  }
  
  // Se for um timestamp numérico
  if (typeof dateInput === 'number') {
    return new Date(dateInput).toLocaleDateString('pt-BR');
  }
  
  // Se for uma string no formato "YYYY-MM-DD"
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateInput.split('-');
    return `${day}/${month}/${year}`;
  }
  
  // Para strings ISO (como "2023-07-20T12:00:00Z") ou outros formatos
  try {
    const date = new Date(dateInput);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Erro ao formatar data:", e);
    return "Formato desconhecido";
  }
};

export default FormateDate;