import {VO_END, VO_LINES, VO_SUBS} from './vo';

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
  /** the scene's line as first written; on-screen captions now come from the voice (vo.ts) */
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

/** Length of the scene design above; the voiced cut stretches it to the narration (see toDesign). */
export const DESIGN_DURATION = 59;
export const DURATION = VO_END;

/*
 * The scenes were designed on a 59 s silent timeline; the voice-over runs longer and unevenly.
 * Each scene is stretched to its spoken line: it starts a beat before its line and ends a beat
 * before the next one, so headlines, zooms and props land on the words without retiming them.
 */
const REAL = [0, ...VO_LINES.slice(1).map((l) => l.from - 0.2), VO_END];
const DESIGN = [...SCENES.map((s) => s.from), DESIGN_DURATION];

/** Composition time (voice) → scene design time. */
export const toDesign = (t: number) => {
  let i = 0;
  while (i < REAL.length - 2 && t > REAL[i + 1]) i++;
  return DESIGN[i] + ((t - REAL[i]) * (DESIGN[i + 1] - DESIGN[i])) / (REAL[i + 1] - REAL[i]);
};

/** Caption chunks timed word by word to the voice (composition time). */
export const SUBS = VO_SUBS;
