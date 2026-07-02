export function indexOf<T>(
  col: T[], 
  el: T
): number;
export function indexOf<T, K>(
  col: T[], 
  el: K, 
  selector: (item: T) => K
): number;
export function indexOf<T, K>(
  col: T[], 
  el: K, 
  selector?: (el: T) => K
) {
  let left = 0;
  let right = col.length;

  while(left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    const item = col[mid]


    if(item === undefined) break
 
    const current = selector ? selector(item) : item;


    if(current) {
      if(current === el) {
        return mid
      } else if(current < el) {
        left = mid + 1
      } else if(current > el) {
        right = mid - 1
      }
    }
  }

  return -1
}

export function lastIndexOf<T>(
  col: T[], 
  el: T
): number;
export function lastIndexOf<T, K>(
  col: T[], 
  el: K, 
  selector: (item: T) => K
): number;
export function lastIndexOf<T, K>(
  col: T[], 
  el: K,
  selector?: (item: T) => K
) {
  let left = 0;
  let right = col.length;

  while(left < right) {
    const mid = left + Math.floor((right - left) / 2)
    const item = col[mid]


    if(item === undefined) break
 
    const current = selector ? selector(item) : item;

    if(current) {
      if(current <= el) {
        left = mid + 1
      } else {
        right = mid
      }
    }
  }

  const lastIndex = left - 1

  if(lastIndex >= 0 && lastIndex < col.length) {
    if(col[lastIndex] === undefined) return -1

    const item = selector ? selector(col[lastIndex]) : col[lastIndex]

    if(item === el) {
      return lastIndex
    }
  }


  return -1
}