export function buildCliCommandLabel(): string {
  const args = process.argv.slice(2);
  return args.length > 0 ? `ai-ceo ${args.join(" ")}` : "ai-ceo";
}
