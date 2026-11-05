import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/site/pages";
export const Route = createFileRoute("/")({ component: Home });
