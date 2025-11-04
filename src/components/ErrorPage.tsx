export function ErrorPage(props: { error: Error }) {
  return (
    <div class="flex h-dvh w-dvw flex-col items-center justify-center gap-4 bg-red-800 font-mono text-white">
      <h1 class="w-full text-center text-6xl font-bold">Error</h1>
      <p class="w-full text-center text-4xl">{props.error.message}</p>
    </div>
  );
}
