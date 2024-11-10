import { Message } from "amqplib";
import cors from "cors";
import "dotenv/config";
import express, { Application } from "express";
import "express-async-errors";
import mongoose from "mongoose";
import { QUEUES } from "./constants/QUEUES.ts";
import { IRMQPConsumQueue, IRMQPDeclareExchange } from "./interfaces/RMQPInterface.ts";
import { RMQPProvider } from "./providers/RMQPProvider.ts";

class App {
	public express: Application;
	private ips: string;
	private whitelistIps: string[] = [];
	private corsOptions = this.getCorsOptions();
	private RMQPProvider: typeof RMQPProvider;

	public constructor() {
		this.express = express();
		this.ips = process.env.IPS!;
		this.whitelistIps = this.ips.split(",")! ?? ["http://localhost:3335"];
		this.RMQPProvider = RMQPProvider;

		this.middlewarePreRoute();
		this.database()
			.then(() => this.declareExchange(QUEUES))
			.then(() => this.consumeQueue(QUEUES));
	}

	private middlewarePreRoute() {
		this.express.use(cors(this.corsOptions as unknown as cors.CorsOptions));
		this.express.use(express.json());
		this.express.disable("X-Powered-By");
	}

	private async database() {
		const URL = process.env.MONGODB_URI!;
		mongoose
			.connect(URL, { dbName: process.env.MONGODB_DATABASE })
			.then(() => console.log(`MongoDB connected!`))
			.catch(() => console.log("Error to connect mongoDB"));
	}

	private getCorsOptions() {
		return {
			origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
				if (this.whitelistIps.indexOf(origin) !== -1) {
					callback(null, true);
				} else {
					callback(null, false);
				}
			},
		};
	}

	private async consumeQueue(consumeData: IRMQPConsumQueue[]) {
		const server = new this.RMQPProvider();
		await server.start();

		for (const { queue } of consumeData) {
			await server.consume(queue, async (message: Message) => {
				const content = JSON.parse(message.content.toString());
				console.log(content);
			});
		}
	}

	private async declareExchange(declareData: IRMQPDeclareExchange[]) {
		const server = new this.RMQPProvider();
		await server.start();

		for (const { queue, exchange, routingKey } of declareData) {
			await server.declareExchange(exchange);
			await server.declareQueue(queue);
			await server.bindQueue(queue, exchange, routingKey);
		}
	}
}

export { App };
