import { CheckoutReturnClient } from './CheckoutReturnClient';

export const metadata = { title: 'Betaling controleren · Smart Buy Store' };

export default function CheckoutReturnPage({ searchParams }: { searchParams: { order?: string } }) {
  return <CheckoutReturnClient orderNumber={searchParams.order || ''} />;
}
