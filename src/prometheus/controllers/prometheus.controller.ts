import * as client from "prom-client";
import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("metrics")
export class PrometheusController {
  @Get()
  async getMetrics(@Res() res: Response) {
    res.set("Content-Type", client.register.contentType);
    res.send(await client.register.metrics());
  }
}
