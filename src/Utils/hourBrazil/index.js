// Formatação básica (DD/MM/YYYY)
export const formatDateOnly = (timestamp) => {
  if (!timestamp) return 'Data não disponível';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Formatação com hora (DD/MM/YYYY HH:MM)
export const formatDateWithTime = (timestamp) => {
  if (!timestamp) return 'Data não disponível';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
// Adicione esta função (ela pode coexistir com as novas)
export const getCurrentDateForDisplay = () => {
  return formatDateOnly(new Date()); // Usa a função de formatação sem hora
};

// Data atual nos dois formatos
export const getCurrentDateOnly = () => formatDateOnly(new Date());
export const getCurrentDateTime = () => formatDateWithTime(new Date());