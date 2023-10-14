/* eslint-disable no-restricted-syntax */
export const getReportMarkdown = ({
  res,
  cfg,
}: {
  res: any
  cfg: any
}): string => {
  const results = []

  for (const key in cfg) {
    if (res[key]) {
      results.push(
        `${cfg[key]}\n\`\`\`\n${JSON.stringify(res[key], null, 2)}\n\`\`\``
      )
    }
  }
  return results.join('\n')
}
