/* @refresh reload */
import "@/index.css";
import { render } from "solid-js/web";
import { App } from "@/components/App.tsx";
import { StateProvider } from "@/lib/state.tsx";

const root = document.getElementById("root");

render(
  () => (
    <StateProvider>
      <App />
    </StateProvider>
  ),
  root!,
);
