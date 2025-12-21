import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { Counter, Gauge, Histogram } from "prom-client";
import * as os from "os";

@Injectable()
export class PrometheusMiddleware implements NestMiddleware {
  private readonly requestCounter: Counter<string>;
  private readonly responseDuration: Histogram<string>;
  private readonly activeRequests: Gauge<string>;
  private readonly errorCounter: Counter<string>;
  private readonly processStartTime: Gauge<string>;
  private readonly processCpuSecondsTotal: Gauge<string>;
  private readonly processResidentMemoryBytes: Gauge<string>;

  private lastCpuUsage: number[];

  private readonly cpuInterval: NodeJS.Timeout;

  constructor() {
    this.requestCounter = new Counter({
      name: "http_requests_total",
      help: "Total number of HTTP requests",
      labelNames: ["method", "route", "status"],
    });

    this.responseDuration = new Histogram({
      name: "http_request_duration_seconds",
      help: "Histogram of HTTP request duration in seconds",
      labelNames: ["method", "route", "status"],
      buckets: [0.1, 0.5, 1, 2, 5, 10], // Seuils de durée
    });

    this.activeRequests = new Gauge({
      name: "http_requests_active",
      help: "Number of active HTTP requests",
    });

    this.errorCounter = new Counter({
      name: "http_requests_errors_total",
      help: "Total number of HTTP request errors",
      labelNames: ["method", "route"],
    });

    this.processStartTime = new Gauge({
      name: "process_start_time_seconds",
      help: "Start time of the process in UNIX timestamp (seconds)",
    });

    this.processCpuSecondsTotal = new Gauge({
      name: "process_cpu_seconds_total",
      help: "Total CPU time the process has consumed in seconds (since start)",
    });

    this.processResidentMemoryBytes = new Gauge({
      name: "process_resident_memory_bytes",
      help: "Resident memory size in bytes (RAM) used by the process",
    });

    this.processStartTime.set(Date.now() / 1000);

    this.lastCpuUsage = os.cpus().map((cpu) => cpu.times.user + cpu.times.nice + cpu.times.sys);
    this.cpuInterval = setInterval(() => {
      this.updateCpuUsage();
      this.updateMemoryUsage();
    }, 1000);
  }

  private updateCpuUsage() {
    const currentCpuUsage = os.cpus().map((cpu) => cpu.times.user + cpu.times.nice + cpu.times.sys);
    const cpuTimeDifference = currentCpuUsage.map(
      (current, index) => current - this.lastCpuUsage[index],
    );
    const totalCpuTime = cpuTimeDifference.reduce((a, b) => a + b, 0);

    this.processCpuSecondsTotal.inc(totalCpuTime / 100);

    this.lastCpuUsage = currentCpuUsage;
  }

  private updateMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    this.processResidentMemoryBytes.set(memoryUsage.rss);
  }

  use(req: Request, res: Response, next: () => void): void {
    if (req.path === "/metrics") return next();

    this.activeRequests.inc();

    const start = Date.now();

    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;

      this.responseDuration.observe(
        {
          method: req.method,
          route: req.route?.path || req.path,
          status: res.statusCode,
        },
        duration,
      );

      this.requestCounter.inc({
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode,
      });

      if (res.statusCode >= 400) {
        this.errorCounter.inc({
          method: req.method,
          route: req.route?.path || req.path,
        });
      }

      this.activeRequests.dec();
    });

    next();
  }

  /**
   * This allows Prometheus Middleware to avoid leaving open handles when running tests
   */
  onModuleDestroy() {
    clearInterval(this.cpuInterval);
  }
}
