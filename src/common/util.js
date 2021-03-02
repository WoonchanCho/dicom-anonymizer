import { useEffect, useRef } from 'react';

import numeral from 'numeral';
export function formatCurrency(num) {
  const str = String(num);
  const decimalPointPlace = str.indexOf('.');
  if (decimalPointPlace < 0) {
    return numeral(str).format('0,0');
  } else {
    if (num > 100) {
      return numeral(str).format('0,0.00');
    } else if (num > 10) {
      return numeral(str).format('0,0.0000');
    } else {
      return numeral(str).format('0,0.00000000');
    }
  }
}

export function formatPercentage(num, decimal) {
  return numeral(num).format('0.0000%');
}

export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
