export const getNormalizedNumber = (txt: string): number => {
  // txt = "#div-name-1234-characteristic:561613213213";
  const numb = txt.replace(/[^0-9]/g, '') // txt.match(/\D/g)

  return parseInt(numb, 10)
}
