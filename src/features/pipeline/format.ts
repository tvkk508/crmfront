export const formatRubles = (value: number) =>
  `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
