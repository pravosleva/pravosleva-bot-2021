import request from 'request'
import {
  Request as IRequest,
  Response as IResponse,
  // NextFunction as INextFunction,
} from 'express'

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

    // if (req.params.ext) {
    //   switch (req.params.ext) {
    //     case 'jpg':
    //     case 'png':
    //       res.setHeader('content-type', `image/${req.params.ext}`)
    //       break
    //     default:
    //       break
    //   }
    // }

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
