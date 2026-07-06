import { config, fields, singleton } from '@keystatic/core';

const makeLanguageFields = () => ({
  nav: fields.object({
    home: fields.text({ label: 'Sākums' }),
    about: fields.text({ label: 'Par mums' }),
    services: fields.text({ label: 'Pakalpojumi' }),
    templates: fields.text({ label: 'Līgumu paraugi' }),
    faq: fields.text({ label: 'BUJ (FAQ)' }),
    contact: fields.text({ label: 'Kontakti' }),
  }, { label: 'Navigācija' }),
  hero: fields.object({
    title: fields.text({ label: 'Virsraksts (Rinda 1)' }),
    subtitle: fields.text({ label: 'Virsraksts (Rinda 2)' }),
    description: fields.text({ label: 'Apraksts', multiline: true }),
    contactBtn: fields.text({ label: 'Pogas Teksts - Kontakti' }),
    servicesBtn: fields.text({ label: 'Pogas Teksts - Pakalpojumi' }),
  }, { label: 'Galvenā (Hero) Sadaļa' }),
  footer: fields.object({
    aboutTitle: fields.text({ label: 'Par Mums Virsraksts' }),
    followTitle: fields.text({ label: 'Seko Mums Virsraksts' }),
    contactTitle: fields.text({ label: 'Kontaktu Virsraksts' }),
    addressLabel: fields.text({ label: 'Adreses etiķete' }),
    rights: fields.text({ label: 'Autortiesību teksts' }),
    privacy: fields.text({ label: 'Privātuma politika saite' }),
    cookies: fields.text({ label: 'Sīkdatņu politika saite' }),
  }, { label: 'Kājene (Footer)' }),
  about: fields.object({
    backBtn: fields.text({ label: 'Poga Atpakaļ' }),
    title: fields.text({ label: 'Virsraksts' }),
    subtitle: fields.text({ label: 'Apakšvirsraksts' }),
    highlight: fields.text({ label: 'Izceltais teksts', multiline: true }),
    p1: fields.text({ label: 'Rindkopa 1', multiline: true }),
    p2: fields.text({ label: 'Rindkopa 2', multiline: true }),
    p3: fields.text({ label: 'Rindkopa 3', multiline: true }),
    p4: fields.text({ label: 'Rindkopa 4', multiline: true }),
    p5: fields.text({ label: 'Rindkopa 5', multiline: true }),
    imageTaglineLine1: fields.text({ label: 'Attēla 1 Tagline Rinda 1' }),
    imageTaglineLine2: fields.text({ label: 'Attēla 1 Tagline Rinda 2' }),
    image3TaglineLine1: fields.text({ label: 'Attēla 2 Tagline Rinda 1' }),
    image3TaglineLine2: fields.text({ label: 'Attēla 2 Tagline Rinda 2' }),
    image4TaglineLine1: fields.text({ label: 'Attēla 3 Tagline Rinda 1' }),
    image4TaglineLine2: fields.text({ label: 'Attēla 3 Tagline Rinda 2' }),
  }, { label: 'Par Mums' }),
  benefits: fields.object({
    q1: fields.object({
      title: fields.text({ label: 'Virsraksts (daļa 1)' }),
      subtitle: fields.text({ label: 'Virsraksts (daļa 2)' }),
      items: fields.array(
        fields.object({
          title: fields.text({ label: 'Virsraksts' }),
          desc: fields.text({ label: 'Apraksts', multiline: true }),
        }),
        { label: 'Punkti', itemLabel: props => props.fields.title.value || 'Punkts' }
      )
    }, { label: 'Jautājums 1 - Piemērotība' }),
    q2: fields.object({
      title: fields.text({ label: 'Virsraksts (daļa 1)' }),
      subtitle: fields.text({ label: 'Virsraksts (daļa 2)' }),
      suffix: fields.text({ label: 'Virsraksts (daļa 3)' }),
      suffix2: fields.text({ label: 'Virsraksts (daļa 4)' }),
      desc: fields.text({ label: 'Kopsavilkums', multiline: true }),
      listPrefix: fields.text({ label: 'Saraksta Ievads' }),
      items: fields.array(
        fields.object({
          title: fields.text({ label: 'Virsraksts' }),
          desc: fields.text({ label: 'Apraksts', multiline: true }),
        }),
        { label: 'Priekšrocības', itemLabel: props => props.fields.title.value || 'Priekšrocība' }
      )
    }, { label: 'Jautājums 2 - Priekšrocības' })
  }, { label: 'Ieguvumi' }),
  services: fields.object({
    title: fields.text({ label: 'Virsraksts (daļa 1)' }),
    subtitle: fields.text({ label: 'Virsraksts (daļa 2)' }),
    description: fields.text({ label: 'Apraksts', multiline: true }),
    learnMore: fields.text({ label: 'Pogas Teksts' }),
    items: fields.array(
      fields.object({
        id: fields.integer({ label: 'ID' }),
        title: fields.text({ label: 'Virsraksts' }),
        desc: fields.text({ label: 'Apraksts', multiline: true }),
      }),
      { label: 'Pakalpojumu saraksts', itemLabel: props => props.fields.title.value || 'Pakalpojums' }
    )
  }, { label: 'Pakalpojumu kopsavilkums mājaslapā' }),
  servicesPage: fields.object({
    backBtn: fields.text({ label: 'Poga Atpakaļ' }),
    title: fields.text({ label: 'Virsraksts' }),
    subtitle: fields.text({ label: 'Apakšvirsraksts' }),
    description: fields.text({ label: 'Kopējais apraksts', multiline: true }),
    descriptionLabel: fields.text({ label: 'Apraksta etiķete' }),
    learnMore: fields.text({ label: 'Pogas Lasīt vairāk teksts' }),
    vatText: fields.text({ label: 'PVN Norāde' }),
    items: fields.array(
      fields.object({
        id: fields.integer({ label: 'ID' }),
        title: fields.text({ label: 'Virsraksts' }),
        intro: fields.text({ label: 'Ievads', multiline: true }),
        points: fields.array(fields.text({ label: 'Punkts' }), { label: 'Saraksta punkti' }),
        outro: fields.text({ label: 'Nobeigums', multiline: true }),
        costTitle: fields.text({ label: 'Cenu sadaļas virsraksts' }),
        costText: fields.text({ label: 'Cenas teksts', multiline: true }),
      }),
      { label: 'Pakalpojumi', itemLabel: props => props.fields.title.value || 'Pakalpojums' }
    )
  }, { label: 'Pakalpojumu Detalizētā Lapa' }),
  pricingPage: fields.object({
    backBtn: fields.text({ label: 'Poga Atpakaļ' }),
    title: fields.text({ label: 'Virsraksts (daļa 1)' }),
    subtitle: fields.text({ label: 'Virsraksts (daļa 2)' }),
    description: fields.text({ label: 'Ievada apraksts', multiline: true }),
    stepsTitle: fields.text({ label: 'Soļu sadaļas virsraksts' }),
    steps: fields.array(fields.text({ label: 'Solis' }), { label: 'Sadarbības soļi' }),
    optionsTitle: fields.text({ label: 'Pakalpojuma veidu virsraksts' }),
    optionsSubtitle: fields.text({ label: 'Pakalpojuma veidu apakšvirsraksts' }),
    modelA: fields.object({
      label: fields.text({ label: 'Sadaļas nosaukums' }),
      badge: fields.text({ label: 'Izcēlums (Badge)' }),
      title: fields.text({ label: 'Virsraksts' }),
      desc: fields.text({ label: 'Apraksts', multiline: true }),
      btn: fields.text({ label: 'Pogas teksts' }),
    }, { label: 'Modelis A' }),
    modelB: fields.object({
      label: fields.text({ label: 'Sadaļas nosaukums' }),
      title: fields.text({ label: 'Virsraksts' }),
      desc: fields.text({ label: 'Apraksts', multiline: true }),
      btn: fields.text({ label: 'Pogas teksts' }),
    }, { label: 'Modelis B' })
  }, { label: 'Sadarbības un Cenu Lapa' }),
  faq: fields.object({
    backBtn: fields.text({ label: 'Poga Atpakaļ' }),
    title: fields.text({ label: 'Virsraksts (daļa 1)' }),
    subtitle: fields.text({ label: 'Virsraksts (daļa 2)' }),
    viewAll: fields.text({ label: 'Poga Skatīt visas atbildes' }),
    items: fields.array(
      fields.object({
        q: fields.text({ label: 'Jautājums' }),
        a: fields.text({ label: 'Atbilde', multiline: true }),
      }),
      { label: 'Jautājumi un Atbildes', itemLabel: props => props.fields.q.value || 'Jautājums' }
    )
  }, { label: 'BUJ (Biežāk Uzdotie Jautājumi)' }),
  process: fields.object({
    title: fields.text({ label: 'Virsraksts (daļa 1)' }),
    subtitle: fields.text({ label: 'Virsraksts (daļa 2)' }),
    desc: fields.text({ label: 'Ievada apraksts', multiline: true }),
    items: fields.array(
      fields.object({
        title: fields.text({ label: 'Solis' }),
        desc: fields.text({ label: 'Apraksts', multiline: true }),
      }),
      { label: 'Soļi', itemLabel: props => props.fields.title.value || 'Solis' }
    )
  }, { label: 'Sadarbības Process' }),
  cookieBanner: fields.object({
    title: fields.text({ label: 'Virsraksts' }),
    description: fields.text({ label: 'Paziņojuma teksts', multiline: true }),
    acceptBtn: fields.text({ label: 'Poga - Apstiprināt visu' }),
    rejectBtn: fields.text({ label: 'Poga - Noraidīt' }),
    settingsBtn: fields.text({ label: 'Poga - Pielāgot izvēli' }),
  }, { label: 'Sīkdatņu Paziņojums' }),
  contact: fields.object({
    backBtn: fields.text({ label: 'Poga Atpakaļ' }),
    title: fields.text({ label: 'Melnā banera Virsraksts' }),
    subtitle: fields.text({ label: 'Melnā banera Apakšvirsraksts' }),
    formTitle: fields.text({ label: 'Sazināties Virsraksts' }),
    formSubtitle: fields.text({ label: 'Sazināties Apakšvirsraksts' }),
    formBoxTitle: fields.text({ label: 'Formas Rāmja Virsraksts' }),
    labelName: fields.text({ label: 'Lauks: Vārds, Uzvārds' }),
    labelCompany: fields.text({ label: 'Lauks: Uzņēmums' }),
    labelEmail: fields.text({ label: 'Lauks: E-pasts' }),
    labelPhone: fields.text({ label: 'Lauks: Telefons' }),
    labelMessage: fields.text({ label: 'Lauks: Ziņojums' }),
    consentText: fields.text({ label: 'Datu apstrādes piekrišana (ievads)', multiline: true }),
    privacyLink: fields.text({ label: 'Datu apstrādes saites teksts' }),
    submitBtn: fields.text({ label: 'Pogas teksts - Nosūtīt' }),
    submitting: fields.text({ label: 'Pogas teksts - Sūta' }),
    successTitle: fields.text({ label: 'Pateicības loga virsraksts' }),
    successMessage: fields.text({ label: 'Pateicības ziņojums', multiline: true }),
    newRequestBtn: fields.text({ label: 'Poga Nosūtīt jaunu' }),
    infoTitle: fields.text({ label: 'Sānu rāmja virsraksts' }),
    infoSubtitle: fields.text({ label: 'Sānu rāmja apakšvirsraksts' }),
    callUs: fields.text({ label: 'Etiķete: Zvaniet' }),
    writeUs: fields.text({ label: 'Etiķete: Rakstiet' }),
    contactBtn: fields.text({ label: 'Galvenā navigācijas poga' }),
  }, { label: 'Kontakti un Biznesa Informācija' }),
  privacy: fields.object({
    title: fields.text({ label: 'Virsraksts' }),
    subtitle: fields.text({ label: 'Apakšvirsraksts' }),
    lastUpdated: fields.text({ label: 'Pēdējo reizi atjaunots' }),
    sections: fields.array(
      fields.object({
        title: fields.text({ label: 'Sadaļas virsraksts' }),
        content: fields.text({ label: 'Saturs', multiline: true }),
      }),
      { label: 'Sadaļas', itemLabel: props => props.fields.title.value || 'Sadaļa' }
    )
  }, { label: 'Privātuma Politika' }),
  cookies: fields.object({
    title: fields.text({ label: 'Virsraksts' }),
    subtitle: fields.text({ label: 'Apakšvirsraksts' }),
    lastUpdated: fields.text({ label: 'Pēdējo reizi atjaunots' }),
    sections: fields.array(
      fields.object({
        title: fields.text({ label: 'Sadaļas virsraksts' }),
        content: fields.text({ label: 'Saturs', multiline: true }),
      }),
      { label: 'Sadaļas', itemLabel: props => props.fields.title.value || 'Sadaļa' }
    )
  }, { label: 'Sīkdatņu Politika' })
});

export default config({
  storage: {
    kind: 'local',
  },
  collections: {},
  singletons: {
    translations: singleton({
      label: 'Mājaslapas Saturs un Teksti',
      path: 'src/data/translations',
      format: { data: 'json' },
      schema: {
        lv: fields.object(makeLanguageFields(), { label: 'Latviešu Valoda' }),
        en: fields.object(makeLanguageFields(), { label: 'English' }),
        ru: fields.object(makeLanguageFields(), { label: 'Русский' }),
      }
    }),
    articles_collection: singleton({
      label: 'Raksti (Noderīgi)',
      path: 'src/data/articles',
      format: { data: 'json' },
      schema: {
        articles: fields.array(
          fields.object({
            id: fields.integer({ label: 'ID (secīgs skaitlis)' }),
            slug: fields.text({ label: 'Slug (Unikāla saite, piem: jaunumi-2025)' }),
            image: fields.text({ label: 'Attēla ceļš (webp), piem: /images/noderigi/raksti/nosaukums.webp' }),
            title: fields.text({ label: 'Nosaukums' }),
            excerpt: fields.text({ label: 'Īss izvilkums (Sarakstam)' }),
            content: fields.array(fields.text({ label: 'Rindkopa' }), { label: 'Rindkopu saturs' }),
          }),
          { label: 'Saraksts ar Rakstiem', itemLabel: props => props.fields.title.value || 'Raksts' }
        )
      }
    }),
    documents_collection: singleton({
      label: 'Līgumu Paraugi',
      path: 'src/data/documents',
      format: { data: 'json' },
      schema: {
        documents: fields.array(
          fields.object({
            id: fields.text({ label: 'Kods / ID (piem: telpu-ires-ligums)' }),
            title: fields.object({
              lv: fields.text({ label: 'Latviski' }),
              en: fields.text({ label: 'English' }),
              ru: fields.text({ label: 'Русский' }),
            }, { label: 'Nosaukums' }),
            price: fields.integer({ label: 'Cena eiro (piemēram: 15 vai 150)' }),
            isService: fields.checkbox({ label: 'Vai tas ir pakalpojums (Service)?', defaultValue: false }),
          }),
          { label: 'Līgumu paraugu saraksts', itemLabel: props => props.fields.id.value || 'Līgums' }
        )
      }
    }),
    custom_pages_collection: singleton({
      label: 'Jaunas Lapas',
      path: 'src/data/pages',
      format: { data: 'json' },
      schema: {
        pages: fields.array(
          fields.object({
            slug: fields.text({ label: 'Slug (Saites adrese, piem: galerijas)' }),
            title: fields.text({ label: 'Lapas nosaukums (Virsraksts)' }),
            showInHeader: fields.checkbox({ label: 'Rādīt augšējā rīkjoslā (Navigācijā)?', defaultValue: false }),
            headerOrder: fields.integer({ label: 'Secība rīkjoslā (Skaitlis, piem: 1)', defaultValue: 5 }),
            content: fields.text({ label: 'Lapas ievada saturs / teksts (atbalsta markdown)', multiline: true }),
            images: fields.array(
              fields.object({
                image: fields.text({ label: 'Attēla ceļš (webp), piem: /images/galerija/bilde.webp' }),
                caption: fields.text({ label: 'Paraksts' }),
              }),
              { label: 'Attēlu galerija', itemLabel: props => props.fields.caption.value || 'Attēls' }
            )
          }),
          { label: 'Lapu saraksts', itemLabel: props => props.fields.title.value || 'Lapa' }
        )
      }
    })
  }
});
