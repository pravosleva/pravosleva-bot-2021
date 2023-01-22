export const getNormalizedNumber = (txt: string): number => {
  // txt = "#div-name-1234-characteristic:561613213213";
  let numb
  try {
    numb = txt.replace(/[^0-9]/g, '') // txt.match(/\D/g)
  } catch (err) {
    numb = Number(txt)
  }

  // console.log(numb)
  // console.log(parseInt(numb, 10))

  return parseInt(numb, 10)
}
