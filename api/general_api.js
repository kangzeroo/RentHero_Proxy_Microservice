
exports.extract_area_code_from_national_format = (number) => {
  const area_code = number.split('(')[1].split(')')[0]
  return area_code
}
