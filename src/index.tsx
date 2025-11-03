/* @refresh reload */
import { render } from "solid-js/web";
import { App } from "@/components/App.tsx";
import "@/index.css";

const root = document.getElementById("root");

render(() => <App />, root!);
