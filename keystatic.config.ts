import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: process.env.NODE_ENV === 'development'
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'avenuegrouplv/Avenuegroup_final',
      },
  collections: {
    pages: collection({
      label: 'Lapas (Pages)',
      slugField: 'title',
      path: 'content/pages/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Lapas nosaukums (Page title)' } }),
        seoTitle: fields.text({ label: 'SEO virsraksts (SEO Title)' }),
        seoDescription: fields.text({ label: 'SEO apraksts (SEO Description)', multiline: true }),
        mainHeading: fields.text({ label: 'Galvenais virsraksts (Main heading)' }),
        mainText: fields.text({ label: 'Galvenais teksts (Main text)', multiline: true }),
        heroImageUrl: fields.text({ label: 'Hero attēla URL (Hero image URL)' }),
        contentBlocks: fields.array(
          fields.object({
            title: fields.text({ label: 'Bloka virsraksts (Block title)' }),
            text: fields.text({ label: 'Bloka teksts (Block text)', multiline: true }),
          }),
          {
            label: 'Satura bloki (Content blocks)',
            itemLabel: props => props.fields.title.value || 'Satura bloks',
          }
        ),
      },
    }),
    projects: collection({
      label: 'Projekti (Projects)',
      slugField: 'title',
      path: 'content/projects/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Projekta nosaukums (Project title)' } }),
        shortDescription: fields.text({ label: 'Īss apraksts (Short description)', multiline: true }),
        fullDescription: fields.text({ label: 'Pilns apraksts (Full description)', multiline: true }),
        mainImageUrl: fields.text({ label: 'Galvenā attēla URL (Main image URL)' }),
        galleryImages: fields.array(
          fields.text({ label: 'Attēla URL (Image URL)' }),
          {
            label: 'Galerijas attēli (Gallery images)',
            itemLabel: props => props.value || 'Attēla URL',
          }
        ),
        location: fields.text({ label: 'Atrašanās vieta (Location)' }),
        year: fields.text({ label: 'Gads (Year)' }),
      },
    }),
    blog: collection({
      label: 'Blogs / Raksti (Blog)',
      slugField: 'title',
      path: 'content/blog/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Raksta nosaukums (Title)' } }),
        date: fields.date({ label: 'Datums (Date)', defaultValue: { kind: 'today' } }),
        coverImageUrl: fields.text({ label: 'Vāka attēla URL (Cover image URL)' }),
        excerpt: fields.text({ label: 'Īss izvilkums (Excerpt)', multiline: true }),
        articleContent: fields.text({ label: 'Raksta saturs (Article content)', multiline: true }),
      },
    }),
  },
  singletons: {
    settings: singleton({
      label: 'Globālie iestatījumi (Settings)',
      path: 'content/settings',
      format: { data: 'json' },
      schema: {
        companyName: fields.text({ label: 'Uzņēmuma nosaukums (Company name)' }),
        logoUrl: fields.text({ label: 'Logotipa URL (Logo URL)' }),
        phone: fields.text({ label: 'Tālrunis (Phone)' }),
        email: fields.text({ label: 'E-pasts (Email)' }),
        address: fields.text({ label: 'Adrese (Address)' }),
        footerText: fields.text({ label: 'Kājenes teksts (Footer text)', multiline: true }),
        socialMediaLinks: fields.array(
          fields.object({
            platform: fields.text({ label: 'Platformas nosaukums (piem. Facebook)' }),
            url: fields.text({ label: 'Saite (URL)' }),
          }),
          {
            label: 'Sociālie tīkli (Social media links)',
            itemLabel: props => `${props.fields.platform.value || 'Sociālais tīkls'}: ${props.fields.url.value || ''}`,
          }
        ),
      },
    }),
  },
});
