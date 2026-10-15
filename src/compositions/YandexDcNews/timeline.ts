// All timings in seconds. Scenes cross-dissolve through blur over XF.
export const XF = 0.3;
export const DURATION = 29;

type Zoom = {t: number; s: number; x: number; y: number};
export type Scene = {from: number; to: number; head: string[]; zooms: Zoom[]};

// Shot sizes alternate: medium → medium-close → wide → medium → close → wide → wide (static end).
export const SCENES: Scene[] = [
  {from: 0, to: 4.4, head: ['Три дата-центра', 'за *четыре* дня'], zooms: [{t: 3.1, s: 1.15, x: 540, y: 1073}]},
  {from: 4.4, to: 8.6, head: ['Облако', '*ограничено*'], zooms: [{t: 2.6, s: 1.2, x: 540, y: 950}]},
  {from: 8.6, to: 13.0, head: ['Что *сбоило*'], zooms: []},
  {from: 13.0, to: 17.0, head: ['Задело', '*партнёров*'], zooms: [{t: 3.0, s: 1.14, x: 540, y: 1000}]},
  {from: 17.0, to: 21.0, head: ['Новое *железо*', 'ждать долго'], zooms: [{t: 1.9, s: 1.25, x: 540, y: 810}]},
  {from: 21.0, to: 25.6, head: ['Возможные', '*последствия*'], zooms: []},
  {from: 25.6, to: DURATION, head: ['Сроков', 'пока *нет*'], zooms: []},
];

export const SUBS = [
  {from: 0.5, to: 1.3, text: 'Удары'},
  {from: 1.3, to: 2.3, text: 'беспилотников'},
  {from: 2.3, to: 3.3, text: 'три площадки'},
  {from: 3.3, to: 4.3, text: 'Владимир встал'},
  {from: 4.8, to: 5.6, text: 'Облако'},
  {from: 5.6, to: 6.7, text: 'с ограничениями'},
  {from: 6.7, to: 7.8, text: 'тысячи клиентов'},
  {from: 7.8, to: 8.5, text: 'ждут'},
  {from: 9.0, to: 9.8, text: 'Платежи'},
  {from: 9.8, to: 10.6, text: 'реклама'},
  {from: 10.6, to: 11.4, text: 'аналитика'},
  {from: 11.4, to: 12.8, text: 'файлы, звонки'},
  {from: 13.4, to: 14.3, text: 'Не только'},
  {from: 14.3, to: 15.0, text: 'Яндекс'},
  {from: 15.0, to: 15.9, text: 'магазины'},
  {from: 15.9, to: 16.8, text: 'провайдеры'},
  {from: 17.4, to: 18.4, text: 'Замена'},
  {from: 18.4, to: 19.5, text: 'не быстрая'},
  {from: 19.5, to: 20.8, text: 'дефицит'},
  {from: 21.4, to: 22.6, text: 'Это прогнозы'},
  {from: 22.6, to: 23.8, text: 'не факты'},
  {from: 23.8, to: 25.4, text: 'но реальные'},
  {from: 26.0, to: 27.0, text: 'Следим'},
  {from: 27.0, to: 28.8, text: 'за новостями'},
];
