import type { NextFunction, Request, Response } from "express";
import { sparePartUsageService, type AdjustUsagePayload } from "../services/SparePartUsageService";
import { ServiceError } from "../utils/ServiceError";

const wrap = (err: unknown, action: string): ServiceError => {
  if (err instanceof ServiceError) return err;
  console.error("SparePartUsageController." + action, err);
  return new ServiceError(500, "INTERNAL_ERROR", err instanceof Error ? err.message : String(err));
};

export const sparePartUsageController = {
  list: (_req: Request, res: Response) => res.json(sparePartUsageService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(sparePartUsageService.create(req.body));
    } catch (err) {
      next(wrap(err, "create"));
    }
  },
  adjust: (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req.body ?? {}) as AdjustUsagePayload;
      res.json(sparePartUsageService.adjust(Number(req.params.id), payload));
    } catch (err) {
      next(wrap(err, "adjust"));
    }
  }
};
