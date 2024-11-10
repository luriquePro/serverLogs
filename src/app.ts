import { Message } from "amqplib";
import cors from "cors";
import "dotenv/config";
import express, { Application } from "express";
import "express-async-errors";
import mongoose from "mongoose";
import { QUEUES } from "./constants/QUEUES.ts";
import { IRMQPConsumQueue, IRMQPDeclareExchange } from "./interfaces/RMQPInterface.ts";
import { RMQPProvider } from "./providers/RMQPProvider.ts";
import { EntityLogRecordService } from "./usecases/EntityLogRecord/EntityLogRecordService.ts";

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

		console.log(
			JSON.stringify({
				entity: "users",
				entityId: "1",
				trace_id: "123",
				type: "error",
				statusCode: 400,
				title: "User already exists with this CPF",
				description: "Send a new request to register a new user With the same CPF already exists",
				datetime: "2023-02-01T00:00:00.000Z",
				objectData: {
					cpf: "123",
					name: "John Doe",
					email: "2n9V4@example.com",
					password: "123456",
				},
			}),
		);
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
				const entityLog = await EntityLogRecordService.saveEntityLog(content);
				if (entityLog) console.log("EntityLogRecord created: ", entityLog);
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
