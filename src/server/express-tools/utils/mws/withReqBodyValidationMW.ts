import {
  Request as IRequest,
  Response as IResponse,
  NextFunction as INextFunction,
} from 'express'
import { THelp } from '~/bot/utils/interfaces'

type TProps = {
  // validateFn: (a: any) => boolean;
  rules: THelp
}

export const withReqBodyValidationMW =
  ({ rules }: TProps) =>
  (req: IRequest, res: IResponse, next: INextFunction) => {
    // -- NOTE: Errs handler
    const errs: string[] = []
    for (const key in rules.params.body) {
      if (rules.params.body[key]?.required && !req.body[key])
        errs.push(
          `Missing required param: \`${key}\` (${rules.params.body[key].descr})`
        )
    }
    if (errs.length > 0)
      return res.status(400).send({
        ok: false,
        message: `ERR! ${errs.join('; ')}`,
        _originalBody: req.body,
        // rules,
      })
    // --

    return next()
  }
