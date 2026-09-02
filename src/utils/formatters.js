/**
 * Formate une date ISO (ex: createdAt Mongoose) en format lisible en français.
 * @param {string|Date} isoString 
 * @param {boolean} includeTime - Inclure l'heure (HH:mm) ou non
 * @returns {string} Date formatée ou '-' si inexistante
 */
export const formatDate = (isoString, includeTime = false) => {
  if (!isoString) return '-';
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  };

  return new Date(isoString).toLocaleDateString('fr-FR', options);
};

// Format YYYY-MM-DD pour les inputs <input type="date">
export const formatDateForInput = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
};