import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeCatalogSource } from "@/data/sources/mockCatalogSource";
import { logger } from "@/infrastructure/logging/logger";

async function bootstrap() {
	try {
		await initializeCatalogSource();
	} catch (error) {
		logger.log({
			level: "error",
			message: "Catalog initialization failed. Rendering app with current in-memory snapshot.",
			timestamp: new Date().toISOString(),
			context: {
				error,
			},
		});
	}

	createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
