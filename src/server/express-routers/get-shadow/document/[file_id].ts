import {
  Request as IRequest,
  Response as IResponse,
  // NextFunction as INextFunction,
} from 'express'
import request from 'request'

export const docsShadow = async function (
  req: IRequest & { bot: any },
  res: IResponse
) {
  const { file_id } = req.params

  if (!file_id)
    return res.status(400).json({
      ok: false,
      message: 'Check req.params.file_id',
    })

  try {
    const tgFileUrl = await req.bot.telegram.getFileLink(file_id)

    if (tgFileUrl) return request(tgFileUrl).pipe(res)

    return res.status(500).json({
      ok: false,
      _originalParams: req.params,
      message: `typeof tgFileUrl is ${typeof tgFileUrl}`,
    })
  } catch (err) {
    return res.status(500).json({
      ok: false,
      _originalParams: req.params,
      message: `ERR: ${err.message || 'No err.message'}`,
    })
  }
}
