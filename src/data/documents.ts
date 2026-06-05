export interface DocumentItem {
  id: string;
  title: {
    lv: string;
    en: string;
    ru: string;
  };
  price: number;
  isService?: boolean;
}

export const documents: DocumentItem[] = [
  {
    id: 'pirkuma-ligums-dzivoklis',
    title: {
      lv: 'Nekustamā īpašuma pirkuma līgums (dzīvoklis, māja)',
      en: 'Real Estate Purchase Agreement (apartment, house)',
      ru: 'Договор купли-продажи недвижимости (квартира, дом)',
    },
    price: 150.00,
  },
  {
    id: 'pirkuma-ligums-zeme',
    title: {
      lv: 'Nekustamā īpašuma pirkuma līgums (zeme)',
      en: 'Real Estate Purchase Agreement (land)',
      ru: 'Договор купли-продажи недвижимости (земля)',
    },
    price: 150.00,
  },
  {
    id: 'davinajuma-ligums',
    title: {
      lv: 'Nekustamā īpašuma dāvinājuma līgums',
      en: 'Real Estate Donation Agreement',
      ru: 'Договор дарения недвижимости',
    },
    price: 130.00,
  },
  {
    id: 'mainas-ligums',
    title: {
      lv: 'Nekustamā īpašuma maiņas līgums',
      en: 'Real Estate Exchange Agreement',
      ru: 'Договор обмена недвижимости',
    },
    price: 130.00,
  },
  {
    id: 'ires-ligums',
    title: {
      lv: 'Nekustamā īpašuma īres līgums (dzīvojamās telpas)',
      en: 'Real Estate Rental Agreement (residential)',
      ru: 'Договор аренды недвижимости (жилые помещения)',
    },
    price: 150.00,
  },
  {
    id: 'nomas-ligums-komerc',
    title: {
      lv: 'Telpu nomas līgums (komercplatības)',
      en: 'Commercial Lease Agreement',
      ru: 'Договор аренды помещений (коммерческие площади)',
    },
    price: 150.00,
  },
  {
    id: 'zemes-nomas-ligums',
    title: {
      lv: 'Zemes nomas līgums',
      en: 'Land Lease Agreement',
      ru: 'Договор аренды земли',
    },
    price: 130.00,
  },
  {
    id: 'apbuves-tiesibu-ligums',
    title: {
      lv: 'Apbūves tiesību līgums',
      en: 'Building Rights Agreement',
      ru: 'Договор о праве застройки',
    },
    price: 150.00,
  },
  {
    id: 'servituta-ligums',
    title: {
      lv: 'Servitūta līgums (piemēram, ceļa servitūts)',
      en: 'Easement Agreement (e.g., road easement)',
      ru: 'Договор сервитута (например, дорожный сервитут)',
    },
    price: 130.00,
  },
  {
    id: 'apsaimniekosanas-ligums',
    title: {
      lv: 'Nekustamā īpašuma apsaimniekošanas līgums',
      en: 'Real Estate Management Agreement',
      ru: 'Договор управления недвижимостью',
    },
    price: 170.00,
  },
  {
    id: 'starpniecibas-ligums',
    title: {
      lv: 'Starpniecības līgums (nekustamā īpašuma aģenti)',
      en: 'Brokerage Agreement (real estate agents)',
      ru: 'Договор посредничества (агенты по недвижимости)',
    },
    price: 150.00,
  },
  {
    id: 'rezervacijas-ligums',
    title: {
      lv: 'Rezervācijas līgums (pirms pirkuma)',
      en: 'Reservation Agreement (pre-purchase)',
      ru: 'Договор бронирования (перед покупкой)',
    },
    price: 130.00,
  },
  {
    id: 'prieksligums',
    title: {
      lv: 'Priekšlīgums par nekustamā īpašuma iegādi',
      en: 'Preliminary Agreement for Real Estate Acquisition',
      ru: 'Предварительный договор о покупке недвижимости',
    },
    price: 130.00,
  },
  {
    id: 'hipotekas-ligums',
    title: {
      lv: 'Hipotēkas līgums (ar banku)',
      en: 'Mortgage Agreement (with bank)',
      ru: 'Ипотечный договор (с банком)',
    },
    price: 150.00,
  },
  {
    id: 'kopipasuma-ligums',
    title: {
      lv: 'Kopīpašuma lietošanas kārtības līgums',
      en: 'Joint Property Use Agreement',
      ru: 'Договор о порядке пользования общей собственностью',
    },
    price: 180.00,
  },
  {
    id: 'buvdarbu-ligums',
    title: {
      lv: 'Būvdarbu līgums',
      en: 'Construction Work Contract',
      ru: 'Договор на строительные работы',
    },
    price: 180.00,
  },
  {
    id: 'projektesanas-ligums',
    title: {
      lv: 'Projektēšanas līgums',
      en: 'Design Services Agreement',
      ru: 'Договор на проектирование',
    },
    price: 180.00,
  },
  {
    id: 'autoruzraudzibas-ligums',
    title: {
      lv: 'Autoruzraudzības līgums',
      en: 'Author Supervision Agreement',
      ru: 'Договор авторского надзора',
    },
    price: 180.00,
  },
  {
    id: 'buvuzraudzibas-ligums',
    title: {
      lv: 'Būvuzraudzības līgums',
      en: 'Construction Supervision Agreement',
      ru: 'Договор строительного надзора',
    },
    price: 180.00,
  },
  {
    id: 'remontdarbu-ligums',
    title: {
      lv: 'Remontdarbu līgums',
      en: 'Renovation Work Contract',
      ru: 'Договор на ремонтные работы',
    },
    price: 180.00,
  },
  {
    id: 'inzenerkomunikaciju-ligums',
    title: {
      lv: 'Inženierkomunikāciju pieslēguma līgums (elektrība, ūdens u.c.)',
      en: 'Utility Connection Agreement (electricity, water, etc.)',
      ru: 'Договор на подключение инженерных коммуникаций',
    },
    price: 180.00,
  },
  {
    id: 'uzturesanas-apsardzes-ligums',
    title: {
      lv: 'Teritorijas uzturēšanas / apsardzes līgums',
      en: 'Territory Maintenance / Security Agreement',
      ru: 'Договор на обслуживание территории / охрану',
    },
    price: 150.00,
  },
  {
    id: 'prasibas-pieteikums-parads',
    title: {
      lv: 'Prasības pieteikums par nomas/īres maksas parāda piedziņu',
      en: 'Claim for Recovery of Rent Arrears',
      ru: 'Исковое заявление о взыскании долга по аренде',
    },
    price: 250.00,
  },
  {
    id: 'prasibas-pieteikums-ipasuma-tiesibas',
    title: {
      lv: 'Prasības pieteikums par īpašuma tiesību atzīšanu',
      en: 'Claim for Recognition of Property Rights',
      ru: 'Исковое заявление о признании права собственности',
    },
    price: 170.00,
  },
  {
    id: 'pieteikums-zemesgramatai',
    title: {
      lv: 'Pieteikums zemesgrāmatai (īpašuma tiesību nostiprināšanai)',
      en: 'Application to Land Registry',
      ru: 'Заявка в Земельную книгу',
    },
    price: 130.00,
  },
  {
    id: 'pilnvara',
    title: {
      lv: 'Pilnvara nekustamā īpašuma darījumiem',
      en: 'Power of Attorney for Property Transactions',
      ru: 'Доверенность на сделки с недвижимостью',
    },
    price: 70.00,
  },
  {
    id: 'sia-registracija',
    title: {
      lv: 'Dokumenti SIA reģistrācijai UR',
      en: 'Documents for LLC (SIA) Registration',
      ru: 'Документы для регистрации ООО (SIA)',
    },
    price: 170.00,
  },
  {
    id: 'biedribas-registracija',
    title: {
      lv: 'Dokumenti biedrības reģistrācijai UR',
      en: 'Documents for Association Registration',
      ru: 'Документы для регистрации общества',
    },
    price: 170.00,
  },
  {
    id: 'pvn-registracija',
    title: {
      lv: 'Pieteikums PVN reģistrācijai',
      en: 'Application for VAT Registration',
      ru: 'Заявление на регистрацию НДС',
    },
    price: 270.00,
  },
  {
    id: 'asv-kompanija-konts-stripe',
    title: {
      lv: 'Kompānijas atvēršana ASV, bankas konts, Stripe pieslēgšana (priekšapmaksa 50%)',
      en: 'US Company Formation, Bank Account, Stripe Connection (50% prepayment)',
      ru: 'Регистрация компании в США, банковский счет, подключение Stripe (предоплата 50%)',
    },
    price: 1500.00,
    isService: true,
  },
];
