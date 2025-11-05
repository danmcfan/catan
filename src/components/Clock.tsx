import { createSignal, onCleanup, onMount } from "solid-js";

export function Clock() {
  const [seconds, setSeconds] = createSignal(60);
  let interval: number | undefined;

  const formattedSeconds = () => {
    const minutes = Math.floor(seconds() / 60);
    const remainingSeconds = seconds() % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  onMount(() => {
    interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
      if (seconds() <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="flex h-full w-32 items-center justify-center rounded-md border-2 border-black bg-linear-to-b from-zinc-200 to-zinc-300 shadow-md md:w-48">
      <p class="text-center font-mono text-lg font-bold md:text-2xl">
        {formattedSeconds()}
      </p>
    </div>
  );
}
