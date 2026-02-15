import confetti from "canvas-confetti";

/** Light confetti burst on success (gold-themed for brand) */
export function celebrate() {
  const gold = "#D4A843";
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.7 },
    colors: [gold, "#E8C96A", "#FFFFFF"],
  });
}
