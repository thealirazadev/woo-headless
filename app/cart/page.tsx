import type { ReactElement } from 'react';
import { getServerEnv } from '@/lib/env';
import { CartPageContent } from '@/components/cart/CartPageContent';

/** Server wrapper: resolves the public store base URL server-side, then hands it to the client. */
export default function CartPage(): ReactElement {
  const { storeUrl } = getServerEnv();
  return <CartPageContent storeBaseUrl={storeUrl} />;
}
