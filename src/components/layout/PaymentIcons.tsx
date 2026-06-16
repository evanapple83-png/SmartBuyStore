/**
 * Betaalmethode-iconen voor de footer. Elk merk staat als herkenbaar logo in
 * een wit chipje, in plaats van platte tekst-labels. Wordmarks gebruiken de
 * merkkleur; Mastercard/Maestro gebruiken hun bekende dubbele cirkel.
 */

const chip =
  'inline-flex items-center justify-center h-6 px-2 rounded-[5px] bg-white shadow-sm select-none';

function Ideal() {
  return (
    <span className={chip} title="iDEAL" aria-label="iDEAL">
      <span className="text-[11px] font-black leading-none tracking-tight text-[#CC0066]">
        i<span className="text-[#0A0A4A]">DEAL</span>
      </span>
    </span>
  );
}

function Visa() {
  return (
    <span className={chip} title="Visa" aria-label="Visa">
      <span className="text-[12px] font-black italic leading-none tracking-tight text-[#1A1F71]">
        VISA
      </span>
    </span>
  );
}

function Mastercard() {
  return (
    <span className={chip} title="Mastercard" aria-label="Mastercard">
      <svg width="26" height="16" viewBox="0 0 26 16" aria-hidden="true">
        <circle cx="10" cy="8" r="6.5" fill="#EB001B" />
        <circle cx="16" cy="8" r="6.5" fill="#F79E1B" />
        <path d="M13 3a6.49 6.49 0 0 1 0 10 6.49 6.49 0 0 1 0-10Z" fill="#FF5F00" />
      </svg>
    </span>
  );
}

function Maestro() {
  return (
    <span className={chip} title="Maestro" aria-label="Maestro">
      <svg width="26" height="16" viewBox="0 0 26 16" aria-hidden="true">
        <circle cx="10" cy="8" r="6.5" fill="#0099DF" />
        <circle cx="16" cy="8" r="6.5" fill="#ED0006" />
        <path d="M13 3a6.49 6.49 0 0 1 0 10 6.49 6.49 0 0 1 0-10Z" fill="#6C6BBD" />
      </svg>
    </span>
  );
}

function PayPal() {
  return (
    <span className={chip} title="PayPal" aria-label="PayPal">
      <span className="text-[11px] font-black italic leading-none tracking-tight">
        <span className="text-[#003087]">Pay</span><span className="text-[#009CDE]">Pal</span>
      </span>
    </span>
  );
}

function Klarna() {
  return (
    <span
      className="inline-flex items-center justify-center h-6 px-2 rounded-[5px] bg-[#FFB3C7] shadow-sm select-none"
      title="Klarna"
      aria-label="Klarna"
    >
      <span className="text-[11px] font-black leading-none tracking-tight text-[#0A0A0A]">
        Klarna.
      </span>
    </span>
  );
}

function Afterpay() {
  return (
    <span className={chip} title="Afterpay" aria-label="Afterpay">
      <span className="text-[11px] font-black leading-none tracking-tight text-[#0A0A0A]">
        After<span className="text-[#06B6A8]">pay</span>
      </span>
    </span>
  );
}

const ICONS: Record<string, () => React.ReactElement> = {
  iDEAL: Ideal,
  Visa: Visa,
  Mastercard: Mastercard,
  Maestro: Maestro,
  PayPal: PayPal,
  Klarna: Klarna,
  Afterpay: Afterpay,
};

export function PaymentIcons({ methods }: { methods: string[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {methods.map((m) => {
        const Icon = ICONS[m];
        return Icon ? (
          <Icon key={m} />
        ) : (
          <span key={m} className={chip}>
            <span className="text-[11px] font-bold text-[#0A0A0A]">{m}</span>
          </span>
        );
      })}
    </div>
  );
}
