
 const trimString = (str: string): string=> {
    let result = "";
  
    for (let i = 0; i < str.length; i++) {
      if (!isNaN(+str[i])) {
        result += str[i];
      }
    }
  
    return result;
  }

  const isValidString = (str: string, digits: Array<number>): boolean => {
    let count = 0;
  
    for (let i = 0; i < str.length; i++) {
      if (!isNaN(+str[i])) {
        if (digits.includes(+str[i])) {
          count++;
          digits.splice(digits.indexOf(+str[i]), 1);
        } else {
          return false;
        }
      } else if (str[i] !== " ") {
        return false;
      }
    }
  
    return count === 4;
  };


  const isValidCal = (str: string, digits: Array<number>): boolean => {

    const regex = /^(?:(?!\d{2,}).)*$/
    if (!regex.test(str)) return false

    const digitStr = trimString(str);
    if (digitStr.length !== 4) {
        return false
    }

    const regex1= new RegExp(`[${digits[0]}${digits[1]}${digits[2]}${digits[3]}]+`);
    regex1.test(digitStr)

    if(!isValidString(digitStr, digits)) return false

    return true

  }

  export default isValidCal;
  