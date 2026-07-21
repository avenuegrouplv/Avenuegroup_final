import React from 'react';
import { Keystatic } from '@keystatic/core/ui';
import keystaticConfig from '../../keystatic.config';

export default function AdminPage() {
  return <Keystatic config={keystaticConfig as any} />;
}
