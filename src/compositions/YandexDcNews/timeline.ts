// All timings in seconds. Scenes cross-dissolve through blur over XF unless `out` says zoom-through.
export const XF = 0.35;

type Zoom = {t: number; s: number; x: number; y: number; d?: number};
export type Scene = {
  from: number;
  to: number;
  /** pinned headline lines; *word* is the accent. Omitted when the scene sets its own big type. */
  head?: string[];
  zooms: Zoom[];
  out?: 'blur' | 'zoom';
  /** captions told as one story: chunks of 2–4 words, timed across the scene by their length */
  subs: string[];
};

/*
 * Story, explained to a friend:
 * Remember Yandex was down? → a data center is a warehouse of computers that runs Taxi, Mail, Disk, Alice →
 * in four days drones hit three of them → the rest got crowded, services slowed → companies that rent
 * the cloud went down too → new hardware takes up to half a year → what next → no dates yet, it's not you →
 * by the way: JetnodeVPN, calm static CTA.
 *
 * Shot sizes per scene (start → key): wide→close→wide | wide→medium | wide→medium→wide | medium→close |
 * wide→close | close→wide (pull-out) | medium | wide | medium static CTA.
 */
export const SCENES: Scene[] = [
  {
    from: 0,
    to: 5.2,
    zooms: [
      {t: 1.7, s: 1.26, x: 540, y: 906},
      {t: 3.6, s: 1, x: 540, y: 900},
    ],
    out: 'zoom',
    subs: ['Помнишь, на днях', 'лежал Яндекс?', 'Сейчас объясню.'],
  },
  {
    from: 5.2,
    to: 11.6,
    head: ['Что такое', '*дата-центр*'],
    zooms: [{t: 4.0, s: 1.14, x: 540, y: 560}],
    subs: ['Дата-центр — это', 'огромный склад', 'компьютеров.', 'На них работают', 'Такси, Почта, Диск', 'и Алиса.'],
  },
  {
    from: 11.6,
    to: 20.4,
    head: ['Три удара', 'за *четыре* дня'],
    zooms: [
      {t: 5.3, s: 1.16, x: 640, y: 660},
      {t: 7.2, s: 1, x: 540, y: 900},
    ],
    subs: ['У Яндекса несколько', 'таких складов.', 'По трём из них', 'ударили беспилотники.', 'Сасово и Владимир', 'встали полностью,', 'Калуга — частично.'],
  },
  {
    from: 20.4,
    to: 26.6,
    head: ['Остальным', 'стало *тесно*'],
    zooms: [
      {t: 0, s: 1.12, x: 540, y: 560, d: 0.001},
      {t: 1.8, s: 1, x: 540, y: 900},
      {t: 4.4, s: 1.2, x: 660, y: 990},
    ],
    subs: ['Нагрузка ушла', 'на уцелевшие площадки,', 'и им стало тесно.', 'Поэтому тормозили', 'Пэй, Диск, Телемост', 'и Метрика.'],
  },
  {
    from: 26.6,
    to: 33.8,
    head: ['Задело', 'и *других*'],
    zooms: [{t: 5.6, s: 1.24, x: 320, y: 1095}],
    out: 'zoom',
    subs: ['Но задело', 'не только Яндекс.', 'Многие компании', 'держат сайты', 'в его облаке.', 'Магнит, Ламода,', 'М.Видео, Дом.ру', 'тоже падали.'],
  },
  {
    from: 33.8,
    to: 39.2,
    head: ['Чинить', '*долго*'],
    zooms: [
      {t: 0, s: 1.3, x: 540, y: 760, d: 0.001},
      {t: 2.2, s: 1, x: 540, y: 900, d: 0.5},
    ],
    subs: ['Чинить придётся', 'долго:', 'новое железо', 'везут до полугода.'],
  },
  {
    from: 39.2,
    to: 46.6,
    head: ['Что будет', '*дальше*'],
    zooms: [{t: 5.4, s: 1.14, x: 540, y: 1120}],
    subs: ['Что дальше?', 'Обычные сервисы', 'оживут за недели.', 'Бизнесу аукнется', 'на полгода-год.', 'А мощностей для ИИ', 'станет ещё меньше.'],
  },
  {
    from: 46.6,
    to: 52,
    zooms: [],
    subs: ['Точных сроков', 'Яндекс не называет.', 'Так что если тормозит,', 'дело не в тебе.'],
  },
  {
    from: 52,
    to: 59,
    zooms: [],
    subs: ['Кстати, о стабильности.', 'JetnodeVPN работает', 'даже при белых списках.', 'Попробуй бесплатно', 'в нашем боте.'],
  },
];

export const DURATION = 59;

/** Caption chunks with times: spread across each scene in proportion to their length. */
export const SUBS = SCENES.flatMap((sc) => {
  const a = sc.from + 0.45;
  const b = sc.to - 0.2;
  const w = sc.subs.map((s) => s.length + 9);
  const sum = w.reduce((x, y) => x + y, 0);
  let t = a;
  return sc.subs.map((text, i) => {
    const d = ((b - a) * w[i]) / sum;
    const c = {from: t, to: t + d, text};
    t += d;
    return c;
  });
});
