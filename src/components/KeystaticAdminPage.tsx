import { Keystatic } from '@keystatic/core/ui';
import keystaticConfig from '../../keystatic.config';

export default function KeystaticAdminPage() {
  return <Keystatic config={keystaticConfig as any} />;
}

