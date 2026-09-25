import type { NextFunction, Request, Response } from "express";
import { repairTicketService, type ConfirmRestorationPayload } from "../services/RepairTicketService";
import { ServiceError } from "../utils/ServiceError";

const wrap = (err: unknown, action: string): ServiceError => {
  if (err instanceof ServiceError) return err;
  console.error("RepairTicketController." + action, err);
  return new ServiceError(500, "INTERNAL_ERROR", err instanceof Error ? err.message : String(err));
};

export const repairTicketController = {
  list: (_req: Request, res: Response) => res.json(repairTicketService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(repairTicketService.create(req.body));
    } catch (err) {
      next(wrap(err, "create"));
    }
  },
  handover: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(repairTicketService.handover(Number(req.params.id)));
    } catch (err) {
      next(wrap(err, "handover"));
    }
  },
  confirmRestoration: (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req.body ?? {}) as ConfirmRestorationPayload;
      res.json(repairTicketService.confirmRestoration(Number(req.params.id), payload));
    } catch (err) {
      next(wrap(err, "confirmRestoration"));
    }
  }
};
