export type DealLeftPanelFieldFormat =
  | "currency"
  | "date"
  | "boolean"
  | "number"
  | "text";

export type DealLeftPanelField = {
  key: string;
  label: string;
  format?: DealLeftPanelFieldFormat;
  options?: string[];
  valueType?: "number" | "string";
};

export type DealLeftPanelSection = {
  id: string;
  title?: string;
  fields: DealLeftPanelField[];
};

export type DealLeftPanelTab = {
  id: "main" | "transport" | "insurance";
  label: string;
  sections: DealLeftPanelSection[];
};

export const dealLeftPanelTabs: DealLeftPanelTab[] = [
  {
    id: "main",
    label: "Основное",
    sections: [
      {
        id: "main-top",
        fields: [
          { key: "responsibleUserId", label: "Ответственный", valueType: "number" },
          { key: "budget", label: "Бюджет", format: "currency" },
          { key: "payment", label: "Оплата", format: "boolean" },
          { key: "paymentForm", label: "Форма оплаты" },
          { key: "from", label: "Откуда" },
          { key: "to", label: "Куда" },
          { key: "plannedDispatch", label: "Планируемая отправка", format: "date" },
          { key: "loadingDate", label: "Дата погрузки", format: "date" },
          { key: "unloadingDate", label: "Дата разгрузки", format: "date" },
          { key: "senderName", label: "Отправитель - ФИО" },
          { key: "senderPhone", label: "Телефон Отправителя" },
          { key: "receiverName", label: "Получатель - ФИО" },
          { key: "receiverPhone", label: "Телефон Получателя" },
        ],
      },
      {
        id: "auto",
        title: "Сведения об авто",
        fields: [
          { key: "carMake", label: "Марка" },
          { key: "carModel", label: "Модель" },
          { key: "carYear", label: "Год выпуска", format: "number" },
          { key: "carRunning", label: "На ходу", format: "boolean" },
          { key: "carKeys", label: "Количество ключей", format: "number" },
          { key: "carMileage", label: "Пробег", format: "number" },
          { key: "carValue", label: "Стоимость автомобиля", format: "currency" },
          { key: "carDimensions", label: "Габариты" },
          { key: "carVin", label: "VIN код" },
          { key: "carPlate", label: "Гос номер" },
        ],
      },
      {
        id: "contact",
        title: "Контакт",
        fields: [
          { key: "company", label: "Компания" },
          { key: "companyName", label: "Название компании" },
          { key: "workPhone", label: "Раб. тел." },
          { key: "workEmail", label: "Email раб." },
          { key: "telegram", label: "Telegram" },
          { key: "avitoProfile", label: "Ссылка на профиль авито" },
          { key: "avitoId", label: "Avito ID", format: "number" },
          { key: "birthDate", label: "Дата рождения", format: "date" },
          { key: "passport", label: "Паспорт" },
          { key: "passportIssueDate", label: "Дата выдачи паспорта", format: "date" },
          { key: "passportIssuerCode", label: "Код подразделения" },
          { key: "userAgreement", label: "Пользовательское соглашение", format: "boolean" },
        ],
      },
    ],
  },
  {
    id: "transport",
    label: "Перевозка",
    sections: [
      {
        id: "transport-top",
        fields: [{ key: "directRoute", label: "Прямой маршрут", format: "boolean" }],
      },
      {
        id: "calculation",
        title: "Калькуляция",
        fields: [
          {
            key: "declaredTransportPrice",
            label: "Объявленная цена перевозки",
            format: "currency",
          },
          { key: "extraInsurance", label: "Доп. Страховка", format: "currency" },
          {
            key: "declaredDealPrice",
            label: "Объявленная цена сделки",
            format: "currency",
          },
          { key: "transportProfit", label: "Прибыль перевозки", format: "currency" },
          { key: "routeCost", label: "Себестоимость маршрута", format: "currency" },
          { key: "transportCost", label: "Себестоимость(транспорт)", format: "currency" },
          { key: "parkingCost", label: "Себестоимость(стоянка)", format: "currency" },
          { key: "inspectionCost", label: "Себестоимость(приемка)", format: "currency" },
          { key: "agentFees", label: "Агентские", format: "currency" },
        ],
      },
      {
        id: "stage-1",
        title: "Этап 1",
        fields: [
          {
            key: "transportType1",
            label: "Тип транспорта",
            options: ["Эвакуатор", "Автовоз", "Закрытый автовоз", "Манипулятор"],
          },
          { key: "from1", label: "Откуда 1" },
          { key: "to1", label: "Куда 1" },
          { key: "carrier1", label: "Перевозчик" },
          { key: "rate1", label: "Ставка 1", format: "currency" },
          { key: "paid1", label: "Оплачено 1", format: "boolean" },
          { key: "loadDate1", label: "Дата погрузки", format: "date" },
          { key: "unloadDate1", label: "Дата разгрузки", format: "date" },
          { key: "parking1", label: "Стоянка" },
          { key: "inspection1", label: "Приемка" },
        ],
      },
      {
        id: "stage-2",
        title: "Этап 2",
        fields: [
          {
            key: "transportType2",
            label: "Тип транспорта",
            options: ["Эвакуатор", "Автовоз", "Закрытый автовоз", "Манипулятор"],
          },
          { key: "from2", label: "Откуда 2" },
          { key: "to2", label: "Куда 2" },
          { key: "carrier2", label: "Перевозчик" },
          { key: "rate2", label: "Ставка 2", format: "currency" },
          { key: "paid2", label: "Оплачено 2", format: "boolean" },
          { key: "loadDate2", label: "Дата погрузки", format: "date" },
          { key: "unloadDate2", label: "Дата разгрузки", format: "date" },
          { key: "parking2", label: "Стоянка" },
          { key: "inspection2", label: "Приемка" },
        ],
      },
      {
        id: "stage-3",
        title: "Этап 3",
        fields: [
          {
            key: "transportType3",
            label: "Тип транспорта",
            options: ["Эвакуатор", "Автовоз", "Закрытый автовоз", "Манипулятор"],
          },
          { key: "from3", label: "Откуда 3" },
          { key: "to3", label: "Куда 3" },
          { key: "carrier3", label: "Перевозчик" },
          { key: "rate3", label: "Ставка 3", format: "currency" },
          { key: "paid3", label: "Оплачено 3", format: "boolean" },
          { key: "loadDate3", label: "Дата погрузки", format: "date" },
          { key: "unloadDate3", label: "Дата разгрузки", format: "date" },
          { key: "parking3", label: "Стоянка" },
          { key: "inspection3", label: "Приемка" },
        ],
      },
    ],
  },
  {
    id: "insurance",
    label: "Страховка",
    sections: [
      {
        id: "insurance-top",
        fields: [
          { key: "insuranceSum", label: "Сумма страхования", format: "currency" },
          { key: "insuranceDeclared", label: "Страхование(объявлено)", format: "currency" },
          {
            key: "insuranceCost",
            label: "Страхование(себестоимость)",
            format: "currency",
          },
          {
            key: "insuranceCoefficient",
            label: "Коэффициент страховки",
            options: ["0.2", "0.25", "0.3"],
            valueType: "number",
          },
          { key: "insurancePaid", label: "Оплачено", format: "boolean" },
          { key: "insuranceProfit", label: "Прибыль страхования", format: "currency" },
        ],
      },
    ],
  },
];
