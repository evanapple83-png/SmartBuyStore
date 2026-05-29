import type { Metadata } from 'next';
import { VerlanglijstClient } from './VerlanglijstClient';

export const metadata: Metadata = {
  title: 'Verlanglijst — Smart Buy Store',
};

export default function VerlanglijstPage() {
  return <VerlanglijstClient />;
}
