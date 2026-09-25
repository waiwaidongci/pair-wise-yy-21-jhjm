import type { NextFunction, Request, Response } from "express";
import { restorationService } from "../services/RestorationService";

export const restorationController = {
  list: (_req: Request, res: Response) => res.json(restorationService.list()),
  confirm: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(restorationService.confirm(req.body));
    } catch (err) {
      next(err);
    }
  },
  adjust: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationService.adjust(req.body));
    } catch (err) {
      next(err);
    }
  }
};
