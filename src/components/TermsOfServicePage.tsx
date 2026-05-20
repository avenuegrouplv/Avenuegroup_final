import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scroll } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const TermsOfServicePage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const content = {
    lv: {
      title: 'Pakalpojuma lietošanas noteikumi',
      lastUpdated: 'Pēdējās izmaiņas: 2026. gada marts',
      sections: [
        {
          title: '1. Vispārīgie noteikumi',
          content: 'Šie noteikumi nosaka kārtību, kādā tiek veikti pirkumi interneta vietnē avenuegroup.lv. Veicot pirkumu, lietotājs apliecina, ka ir iepazinies ar šiem noteikumiem un piekrīt tiem.'
        },
        {
          title: '2. Pakalpojuma raksturs un atbildības ierobežojums',
          content: 'Visi Bibliotēkas sadaļā iegādājamie dokumentu paraugi ir izstrādāti līgumi, kuri satur visus noteikumus, kādus tipiski šādi līgumi satur. Šie dokumenti NAV uzskatāmi par juridisku konsultāciju. Pakalpojuma sniedzējs neuzņemas nekādu atbildību par šo dokumentu izmantošanu konkrētā klienta specifiskajā situācijā vai par jebkādiem zaudējumiem, kas var rasties dokumentu izmantošanas rezultātā.'
        },
        {
          title: '3. Dokumentu stāvoklis un izmaiņas',
          content: 'Dokuments tiek iegādāts tādā stāvoklī, kāds tas ir ("as-is"). Produkta cenā NAV iekļautas nekādas izmaiņas līgumā, pielāgojumi konkrētai situācijai vai juridiskas konsultācijas. Ja lietotājam ir nepieciešams pielāgots līgums vai juridiska palīdzība, lūdzam sazināties ar mums, izmantojot kontaktu sadaļu, lai vienotos par individuālu pakalpojumu.'
        },
        {
          title: '4. Preces saņemšana',
          content: 'Pēc veiksmīgas apmaksas veikšanas, lietotājs e-pastā saņem līgumu uz norādīto e-pasta adresi. Digitālo preču rakstura dēļ, atteikuma tiesības nav izmantojamas pēc tam, kad fails ir nosūtīts pircējam.'
        },
        {
          title: '5. Intelektuālais īpašums',
          content: 'Iegādātie dokumenti ir paredzēti pircēja personīgai vai viņa pārstāvētā uzņēmuma iekšējai lietošanai. Dokumentu tālākpārdošana vai publiska izplatīšana bez Pakalpojuma sniedzēja rakstiskas piekrišanas ir aizliegta.'
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: March 2026',
      sections: [
        {
          title: '1. General Terms',
          content: 'These terms define the ordering procedure on the avenuegroup.lv website. By making a purchase, the user confirms they have read and agree to these terms.'
        },
        {
          title: '2. Nature of Service and Limitation of Liability',
          content: 'All document templates available in the Library section are developed contracts containing all provisions typically found in such contracts. These documents are NOT to be considered legal advice. The service provider assumes no responsibility for the use of these documents in the specific situation of a client or for any damages that may arise from the use of the documents.'
        },
        {
          title: '3. Document Condition and Modifications',
          content: 'The document is purchased as-is. The price does NOT include any modifications to the contract, tailoring to a specific situation, or legal consultations. If the user requires a customized contract or legal assistance, please contact us via the contact section to arrange an individual service.'
        },
        {
          title: '4. Receipt of Goods',
          content: 'After successful payment, the user receives the contract at the specified email address. Due to the nature of digital goods, the right of withdrawal is not applicable after the file has been sent to the buyer.'
        },
        {
          title: '5. Intellectual Property',
          content: 'Purchased documents are intended for the buyers personal or internal company use. Resale or public distribution of the documents without the written consent of the Service Provider is prohibited.'
        }
      ]
    }
  };

  const t_terms = content[language as keyof typeof content] || content.lv;

  return (
    <div className="bg-[#ebebeb] min-h-screen pb-24 text-zinc-800 relative overflow-hidden">

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 bg-white border border-zinc-200/80 px-6 py-2.5 font-bold text-xs uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all duration-300 mb-12 shadow-sm rounded-none cursor-pointer"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>{language === 'lv' ? 'Atpakaļ' : 'Back'}</span>
        </button>

        <div className="mb-12">
          <div className="flex items-center space-x-3 text-yellow-600 mb-4 h-12">
            <Scroll size={36} />
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-zinc-950 uppercase leading-none">
              {t_terms.title}
            </h1>
          </div>
          <p className="text-zinc-400 text-xs italic font-semibold">{t_terms.lastUpdated}</p>
        </div>

        <div className="space-y-6 bg-white p-6 md:p-10 border border-zinc-200 shadow-sm">
          {t_terms.sections.map((section, idx) => (
            <div key={idx} className="space-y-3 pb-6 border-b border-zinc-100 last:border-none last:pb-0">
              <h2 className="text-base md:text-lg font-black italic text-zinc-950 uppercase tracking-tight">{section.title}</h2>
              <p className="text-zinc-650 text-sm md:text-base leading-relaxed italic">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
