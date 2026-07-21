import { config, fields, singleton } from '@keystatic/core';

export default config({
  storage: process.env.NODE_ENV === 'development'
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'avenuegrouplv/Avenuegroup_final',
      },
  singletons: {
    blog: singleton({
      label: 'Noderīgi raksti (Blog)',
      path: 'src/data/content/blog-posts',
      format: { data: 'json' },
      schema: {
        articles: fields.array(
          fields.object({
            id: fields.number({ label: 'ID', validation: { min: 1 } }),
            slug: fields.text({ label: 'Slug / URL ceļš' }),
            image: fields.text({ label: 'Attēla ceļš (piem. /images/noderigi/raksti/image.webp)' }),
            title: fields.text({ label: 'Nosaukums (Title)' }),
            excerpt: fields.text({ label: 'Īss izvilkums (Excerpt)', multiline: true }),
            content: fields.array(
              fields.text({ label: 'Paragrāfs (Rindkopa)' }),
              {
                label: 'Saturs (Rindkopas)',
                itemLabel: props => props.value ? (props.value.length > 40 ? props.value.substring(0, 40) + '...' : props.value) : 'Tukšs paragrāfs',
              }
            )
          }),
          {
            label: 'Raksti',
            itemLabel: props => props.fields.title.value || 'Bez nosaukuma',
          }
        )
      }
    }),
    faq: singleton({
      label: 'Biežāk uzdotie jautājumi (FAQ)',
      path: 'src/data/content/faq',
      format: { data: 'json' },
      schema: {
        translations: fields.object({
          lv: fields.object({
            title: fields.text({ label: 'Title (LV)' }),
            subtitle: fields.text({ label: 'Subtitle (LV)' }),
            viewAll: fields.text({ label: 'View All poga (LV)' }),
            items: fields.array(
              fields.object({
                q: fields.text({ label: 'Jautājums' }),
                a: fields.array(
                  fields.object({
                    title: fields.text({ label: 'Sadaļas nosaukums (neobligāts)' }),
                    desc: fields.text({ label: 'Apraksts / atbilde', multiline: true }),
                  }),
                  {
                    label: 'Atbildes rindkopas',
                    itemLabel: props => props.fields.title.value || props.fields.desc.value?.substring(0, 40) || 'Atbilde',
                  }
                )
              }),
              {
                label: 'FAQ jautājumi (LV)',
                itemLabel: props => props.fields.q.value || 'Jautājums',
              }
            )
          }),
          en: fields.object({
            title: fields.text({ label: 'Title (EN)' }),
            subtitle: fields.text({ label: 'Subtitle (EN)' }),
            viewAll: fields.text({ label: 'View All poga (EN)' }),
            items: fields.array(
              fields.object({
                q: fields.text({ label: 'Question' }),
                a: fields.array(
                  fields.object({
                    title: fields.text({ label: 'Section title (optional)' }),
                    desc: fields.text({ label: 'Description / answer', multiline: true }),
                  }),
                  {
                    label: 'Answer Paragraphs',
                    itemLabel: props => props.fields.title.value || props.fields.desc.value?.substring(0, 40) || 'Answer',
                  }
                )
              }),
              {
                label: 'FAQ Questions (EN)',
                itemLabel: props => props.fields.q.value || 'Question',
              }
            )
          }),
          ru: fields.object({
            title: fields.text({ label: 'Title (RU)' }),
            subtitle: fields.text({ label: 'Subtitle (RU)' }),
            viewAll: fields.text({ label: 'View All poga (RU)' }),
            items: fields.array(
              fields.object({
                q: fields.text({ label: 'Вопрос' }),
                a: fields.array(
                  fields.object({
                    title: fields.text({ label: 'Заголовок раздела (опционально)' }),
                    desc: fields.text({ label: 'Описание / ответ', multiline: true }),
                  }),
                  {
                    label: 'Абзацы ответа',
                    itemLabel: props => props.fields.title.value || props.fields.desc.value?.substring(0, 40) || 'Ответ',
                  }
                )
              }),
              {
                label: 'FAQ Вопросы (RU)',
                itemLabel: props => props.fields.q.value || 'Вопрос',
              }
            )
          }),
        })
      }
    }),
    homepage: singleton({
      label: 'Sākumlapa (Homepage)',
      path: 'src/data/content/homepage',
      format: { data: 'json' },
      schema: {
        hero: fields.object({
          image: fields.text({ label: 'Hero fona attēls' }),
          translations: fields.object({
            lv: fields.object({
              title: fields.text({ label: 'Title (LV)' }),
              subtitle: fields.text({ label: 'Subtitle (LV)' }),
              description: fields.text({ label: 'Apraksts (LV)', multiline: true }),
              contactBtn: fields.text({ label: 'Kontaktu poga (LV)' }),
              servicesBtn: fields.text({ label: 'Pakalpojumu poga (LV)' }),
            }),
            en: fields.object({
              title: fields.text({ label: 'Title (EN)' }),
              subtitle: fields.text({ label: 'Subtitle (EN)' }),
              description: fields.text({ label: 'Description (EN)', multiline: true }),
              contactBtn: fields.text({ label: 'Contact Button (EN)' }),
              servicesBtn: fields.text({ label: 'Services Button (EN)' }),
            }),
            ru: fields.object({
              title: fields.text({ label: 'Title (RU)' }),
              subtitle: fields.text({ label: 'Subtitle (RU)' }),
              description: fields.text({ label: 'Description (RU)', multiline: true }),
              contactBtn: fields.text({ label: 'Contact Button (RU)' }),
              servicesBtn: fields.text({ label: 'Services Button (RU)' }),
            }),
          })
        })
      }
    }),
    customPages: singleton({
      label: 'Dinamiskās lapas (Pages)',
      path: 'src/data/pages',
      format: { data: 'json' },
      schema: {
        pages: fields.array(
          fields.object({
            slug: fields.text({ label: 'Lapas slug (URL ceļš, piem. galerijas)' }),
            title: fields.text({ label: 'Nosaukums' }),
            content: fields.text({ label: 'Saturs', multiline: true }),
            images: fields.array(
              fields.object({
                image: fields.text({ label: 'Attēla ceļš' }),
                caption: fields.text({ label: 'Paraksts' }),
              }),
              {
                label: 'Galerijas attēli',
                itemLabel: props => props.fields.caption.value || props.fields.image.value || 'Attēls',
              }
            )
          }),
          {
            label: 'Dinamiskās lapas',
            itemLabel: props => props.fields.title.value || 'Lapa',
          }
        )
      }
    })
  }
});
