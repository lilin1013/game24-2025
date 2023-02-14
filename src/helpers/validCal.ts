
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

    const regex = /^(?!.*\d{2})[0-9*+\-\/()]+$/g
    if (!regex.test(str)) return false

    const digitStr = trimString(str);
    if (digitStr.length !== 4) {
        return false
    }

    if(!isValidString(digitStr, digits)) return false

    return true

  }

  export default isValidCal;
  