# Project Name

## Stack

- React
- Vite
- TypeScript
- Netlify
- Decap CMS
- Netlify Identity

## Decap CMS

CMS location:

/public/admin/

Files:

- index.html
- config.yml

## Netlify Identity

Enable:

Netlify Dashboard → Identity → Enable Identity

Invite CMS users:

Identity → Invite users

## Git Gateway

Enable:

Netlify Dashboard → Identity → Services → Git Gateway → Enable

## Local development

Install dependencies:

npm install

Run development server:

npm run dev

Build production version:

npm run build

## Deployment

Hosting:

Netlify

Build command:

npm run build

Publish directory:

dist

## Notes

- CMS content is managed through Decap CMS.
- Website code is managed through GitHub.
- Images can be uploaded through Decap CMS Media Library or use external image URLs.
- After CMS changes are published, a Netlify deployment must be published for the changes to appear on the live website.
- The CMS configuration is specific to each project and should reflect the actual website structure.
