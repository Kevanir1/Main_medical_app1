// PESEL validation utility for Polish ID numbers

export const validatePesel = (pesel: string): { valid: boolean; message?: string } => {
  // Remove any spaces
  const cleanPesel = pesel.replace(/\s/g, '');
  
  // Check if exactly 11 digits
  if (!/^\d{11}$/.test(cleanPesel)) {
    return { valid: false, message: 'PESEL musi zawierać dokładnie 11 cyfr' };
  }

  // Checksum validation
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanPesel[i]) * weights[i];
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  
  if (checkDigit !== parseInt(cleanPesel[10])) {
    return { valid: false, message: 'Nieprawidłowa suma kontrolna PESEL' };
  }

  return { valid: true };
};

export const extractBirthDateFromPesel = (pesel: string): Date | null => {
  if (!validatePesel(pesel).valid) return null;
  
  let year = parseInt(pesel.substring(0, 2));
  let month = parseInt(pesel.substring(2, 4));
  const day = parseInt(pesel.substring(4, 6));
  
  // Determine century based on month
  if (month > 80) {
    year += 1800;
    month -= 80;
  } else if (month > 60) {
    year += 2200;
    month -= 60;
  } else if (month > 40) {
    year += 2100;
    month -= 40;
  } else if (month > 20) {
    year += 2000;
    month -= 20;
  } else {
    year += 1900;
  }
  
  return new Date(year, month - 1, day);
};

export const formatPesel = (pesel: string): string => {
  const clean = pesel.replace(/\D/g, '').slice(0, 11);
  return clean;
};
